import { describe, expect, it } from 'vitest'
import { SnbCompeteCore } from './core.js'
import { generationScore } from './score.js'

describe('SNB first-generation compete score', () => {
  it('refuses to mark V1 complete and does not use a reduced-final denominator', () => {
    const score = generationScore()
    expect(score.reducedFinal).toBe(false)
    expect(score.competeBar).toBe(true)
    expect(score.complete).toBe(false)
    expect(score.dsosInCompeteBar).toBe(false)
    expect(score.percent).toBeGreaterThan(68)
    expect(score.percent).toBeLessThan(80)
    expect(score.remaining).toBeGreaterThan(20)
    expect(score.complete).toBe(false)
    const result = new SnbCompeteCore().evaluate()
    expect(result.verification.valid).toBe(true)
    expect(result.ledger.length).toBeGreaterThan(12)
    expect(result.ledger.find(item => item.id === 'world.rrw')?.state).toBe('PARTIAL')
    expect(result.ledger.find(item => item.id === 'world.rrw-persist')?.state).toBe('OPERATIONAL')
    expect(result.ledger.find(item => item.id === 'world.rrw-unify')?.state).toBe('OPERATIONAL')
  })
})
