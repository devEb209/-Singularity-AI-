import { describe, expect, it } from 'vitest'
import { UesShadowCore } from './core.js'
import { createShadowMap, sampleShadow, writeShadow } from './map.js'

describe('UES software shadow map', () => {
  it('marks a point behind an occluder as shadowed and a clear point as lit', () => {
    const map = createShadowMap([0, 1, 0], 20, 2)
    writeShadow(map, [0, 0.8, 0])
    writeShadow(map, [0.05, 0.8, 0])
    writeShadow(map, [-0.05, 0.8, 0])
    const blocked = sampleShadow(map, [0, 0.02, 0])
    const open = sampleShadow(map, [1.3, 0.02, 1.3])
    expect(blocked).toBeLessThan(open)
    const result = new UesShadowCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.virtualShadowMaps).toBe(false)
    expect(result.shadowed).toBeLessThan(result.open)
  })
})
