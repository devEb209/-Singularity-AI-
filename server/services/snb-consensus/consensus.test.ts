import { describe, expect, it } from 'vitest'
import { SnbConsensusCore } from './core.js'
import { fixtureRounds, runConsensus, tallyRound, verifyReceipt } from './tally.js'

describe('SNB multi-round consensus receipts', () => {
  it('continues a split first round, integrates on majority and verifies the HMAC without calling Puter', () => {
    const rounds = fixtureRounds()
    expect(tallyRound(rounds.flat(), 1).decision).toBe('continue')
    const consensus = runConsensus(rounds)
    expect(consensus.decision).toBe('integrate')
    expect(consensus.automaticPuter).toBe(false)
    const rejectOnly = runConsensus([[
      { reviewerId: 'a', modelKey: 'm1', verdict: 'reject', findings: [], round: 1 },
      { reviewerId: 'b', modelKey: 'm2', verdict: 'reject', findings: [], round: 1 },
    ]])
    expect(rejectOnly.decision).toBe('reject')
    const result = new SnbConsensusCore().process('unit-secret', 'hash')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.automaticPuter).toBe(false)
    expect(verifyReceipt('unit-secret', result.payload, result.receipt)).toBe(true)
    expect(verifyReceipt('other', result.payload, result.receipt)).toBe(false)
  })
})
