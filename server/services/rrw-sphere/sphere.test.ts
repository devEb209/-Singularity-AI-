import { describe, expect, it } from 'vitest'
import { RrwSphereCore } from './core.js'

describe('RRW sphere service core', () => {
  it('deepens reference spheres without claiming Genesis finished', () => {
    const result = new RrwSphereCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.hydro.stored).toBe(true)
  })
})
