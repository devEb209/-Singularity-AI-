import { createHmac } from 'node:crypto'

export type ConsensusVerdict = 'accept' | 'revise' | 'reject'

export interface ConsensusBallot {
  reviewerId: string
  modelKey: string
  verdict: ConsensusVerdict
  findings: { code: string; severity: 'info' | 'warning' | 'error'; message: string }[]
  round: number
}

export interface ConsensusRound {
  index: number
  accept: number
  reject: number
  revise: number
  decision: 'integrate' | 'reject' | 'continue'
  independent: boolean
}

const stable = (value: unknown): string =>
  Array.isArray(value)
    ? `[${value.map(stable).join(',')}]`
    : value && typeof value === 'object'
      ? `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`
      : JSON.stringify(value)

export const tallyRound = (ballots: ConsensusBallot[], index: number): ConsensusRound => {
  const current = ballots.filter(item => item.round === index)
  const accept = current.filter(item => item.verdict === 'accept').length
  const reject = current.filter(item => item.verdict === 'reject').length
  const revise = current.filter(item => item.verdict === 'revise').length
  const independent = new Set(current.map(item => item.modelKey)).size === current.length && current.length >= 2
  const majority = Math.ceil(current.length / 2)
  const decision = !independent || current.length < 2
    ? 'continue'
    : accept >= majority && accept > reject
      ? 'integrate'
      : reject >= majority && reject > accept
        ? 'reject'
        : 'continue'
  return { index, accept, reject, revise, decision, independent }
}

export const runConsensus = (rounds: ConsensusBallot[][], maxRounds = 3) => {
  const flat = rounds.flat()
  const history: ConsensusRound[] = []
  let final: ConsensusRound['decision'] = 'continue'
  for (let index = 1; index <= Math.min(maxRounds, rounds.length); index++) {
    const result = tallyRound(flat, index)
    history.push(result)
    if (result.decision !== 'continue') {
      final = result.decision
      break
    }
  }
  return { history, decision: final, ballots: flat.length, automaticPuter: false as const }
}

export const integrationReceipt = (secret: string, payload: unknown) =>
  `snb-consensus-integrate-hmac:${createHmac('sha256', secret).update(stable(payload)).digest('hex')}`

export const verifyReceipt = (secret: string, payload: unknown, receipt: string) =>
  integrationReceipt(secret, payload) === receipt

export const fixtureRounds = (): ConsensusBallot[][] => [
  [
    { reviewerId: 'r1', modelKey: 'specialist-alpha', verdict: 'revise', findings: [{ code: 'mesh-skinny', severity: 'error', message: 'skinny tris' }], round: 1 },
    { reviewerId: 'r2', modelKey: 'critic-beta', verdict: 'accept', findings: [], round: 1 },
    { reviewerId: 'r3', modelKey: 'critic-gamma', verdict: 'revise', findings: [{ code: 'mesh-skinny', severity: 'error', message: 'aspect' }], round: 1 },
  ],
  [
    { reviewerId: 'r1', modelKey: 'specialist-alpha', verdict: 'accept', findings: [], round: 2 },
    { reviewerId: 'r2', modelKey: 'critic-beta', verdict: 'accept', findings: [], round: 2 },
    { reviewerId: 'r3', modelKey: 'critic-gamma', verdict: 'reject', findings: [{ code: 'style', severity: 'warning', message: 'taste' }], round: 2 },
  ],
]
