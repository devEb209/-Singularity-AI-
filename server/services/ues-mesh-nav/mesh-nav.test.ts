import { describe, expect, it } from 'vitest'
import { UesMeshNavCore } from './core.js'
import { navFromPrompt } from './from-mesh.js'

describe('UES navmesh from arbitrary 3D', () => {
  it('finds a walkable path on an open-class mesh and a CSG solid without Recast', () => {
    const fromBridge = navFromPrompt('ponte de pedra com dois arcos')
    expect(fromBridge.found).toBe(true)
    expect(fromBridge.recast).toBe(false)
    expect(fromBridge.funnel).toBeLessThanOrEqual(fromBridge.grid + 1e-6)
    const result = new UesMeshNavCore().process('drone quadricoptero')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.recast).toBe(false)
  })
})
