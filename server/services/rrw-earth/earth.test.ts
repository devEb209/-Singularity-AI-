import { describe, expect, it } from 'vitest'
import { RrwEarthCore } from './core.js'

describe('RRW earth service core', () => {
  it('deepens reference-Earth processes without claiming Genesis finished', () => {
    const result = new RrwEarthCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.earth.oceanSaltier).toBe(true)
  })
})
