import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { fixtureRounds, integrationReceipt, runConsensus, tallyRound, verifyReceipt } from './tally.js'

export class SnbConsensusCore {
  private thesis = new DThesisCore()

  process(secret = 'test-consensus-secret', artifactHash = 'fixture-artifact') {
    const rounds = fixtureRounds()
    const first = tallyRound(rounds.flat(), 1)
    const consensus = runConsensus(rounds, 3)
    const payload = {
      decision: consensus.decision,
      artifactHash,
      rounds: consensus.history,
      ballots: consensus.ballots,
      automaticPuter: false,
    }
    const receipt = integrationReceipt(secret, payload)
    const kernel = runKernel('Consenso multi-round com recibo de integração, sem disparar Puter', 'snb.consensus', ['handoff', 'review'], [
      { module: 'knowledge', accepted: true, note: 'client-reported ballots' },
      { module: 'd-thesis', accepted: true, note: 'independent reviewers' },
      { module: 'consensus', accepted: first.decision === 'continue', note: 'round 1 continues' },
      { module: 'represent', accepted: true, note: 'receipt not model output' },
      { module: 'd-o15', accepted: true, note: 'stop at majority' },
      { module: 'execute', accepted: consensus.decision === 'integrate', note: 'round 2 majority' },
      { module: 'verify', accepted: verifyReceipt(secret, payload, receipt), note: 'hmac' },
      { module: 'refine', accepted: !consensus.automaticPuter, note: 'no auto puter' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Fechar integração por consenso verificável sem fingir invocação automática',
      constraints: ['não disparar os 879', 'client-reported'],
      resources: ['ballots', 'HMAC'],
      priorities: { quality: 8, performance: 6, safety: 9, cost: 4, scalability: 7 },
    })
    return {
      format: 'snb-consensus-v1',
      ...consensus,
      first,
      receipt,
      payload,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && consensus.decision === 'integrate' && verifyReceipt(secret, payload, receipt) && first.decision === 'continue',
        automaticPuter: false,
        providerAttested: false,
      },
      limitations: ['Protocol on submitted ballots', 'Does not invoke Puter'],
    }
  }
}
