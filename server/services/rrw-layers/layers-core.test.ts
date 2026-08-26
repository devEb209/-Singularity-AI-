import { describe, expect, it } from 'vitest'
import { RrwLayersCore } from './core.js'

describe('RRW layers service core', () => {
  it('constructs the 30-layer fabric without claiming Genesis finished', () => {
    const result = new RrwLayersCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.layersPresent).toHaveLength(30)
    expect(result.verification.do15DeletedLayer).toBe(false)
  })
})
