import { describe, expect, it } from 'vitest'
import { UesNmnWorldCore } from './core.js'

describe('UES NMN world bind', () => {
  it('keeps distinct civilian reactions and does not claim consciousness', () => {
    const result = new UesNmnWorldCore().process('p')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.scriptedGlobalReaction).toBe(false)
    expect(result.consciousnessClaim).toBe(false)
    expect(result.distinctActions.length).toBeGreaterThanOrEqual(2)
  })
})
