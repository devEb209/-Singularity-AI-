import { describe, expect, it } from 'vitest'
import { RrwDepthCore } from './core.js'

describe('RRW depth service core', () => {
  it('deepens living cycles without claiming Genesis finished', () => {
    const result = new RrwDepthCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.sapling).toBe(true)
  })
})
