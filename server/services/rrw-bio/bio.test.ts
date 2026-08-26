import { describe, expect, it } from 'vitest'
import { RrwBioCore } from './core.js'

describe('RRW bio service core', () => {
  it('deepens the biosphere without claiming Genesis finished', () => {
    const result = new RrwBioCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.web.grazed).toBe(true)
  })
})
