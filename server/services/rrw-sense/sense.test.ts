import { describe, expect, it } from 'vitest'
import { RrwSenseCore } from './core.js'

describe('RRW sense service core', () => {
  it('deepens senses without claiming Genesis finished', () => {
    const result = new RrwSenseCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.smell.detected).toBe(true)
  })
})
