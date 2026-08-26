import { describe, expect, it } from 'vitest'
import { RrwCivicCore } from './core.js'

describe('RRW civic service core', () => {
  it('deepens civic life and extremes without claiming Genesis finished', () => {
    const result = new RrwCivicCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.civic.reserved).toBe(true)
  })
})
