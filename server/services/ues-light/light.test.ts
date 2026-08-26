import { describe, expect, it } from 'vitest'
import { cookTorranceRgb, evaluateBrdf, fresnel0 } from './brdf.js'
import { UesLightCore } from './core.js'
import { defaultLights, sampleLight } from './lights.js'
import { luminance } from './vec.js'

describe('UES Cook-Torrance lighting', () => {
  it('separates metal from dielectric, ignores backfaces and keeps IBL finite', () => {
    const N: [number, number, number] = [0, 1, 0]
    const metal = evaluateBrdf({ albedo: [0.8, 0.8, 0.8], roughness: 0.18, metalness: 1, ior: 2.5, emission: [0, 0, 0] }, N, N, N, [3, 3, 3])
    const plastic = evaluateBrdf({ albedo: [0.8, 0.8, 0.8], roughness: 0.18, metalness: 0, ior: 1.5, emission: [0, 0, 0] }, N, N, N, [3, 3, 3])
    const metalLobes = cookTorranceRgb({ albedo: [0.8, 0.8, 0.8], roughness: 0.18, metalness: 1, ior: 2.5, emission: [0, 0, 0] }, 1, 1, 1, 1)
    const plasticLobes = cookTorranceRgb({ albedo: [0.8, 0.8, 0.8], roughness: 0.18, metalness: 0, ior: 1.5, emission: [0, 0, 0] }, 1, 1, 1, 1)
    expect(metalLobes.specular[0]).toBeGreaterThan(plasticLobes.specular[0])
    expect(plasticLobes.diffuse[0]).toBeGreaterThan(metalLobes.diffuse[0])
    expect(luminance(metal)).toBeGreaterThan(luminance(plastic))
    expect(evaluateBrdf({ albedo: [1, 0, 0], roughness: 0.3, metalness: 0, ior: 1.5, emission: [0, 0, 0] }, N, N, [0, -1, 0], [4, 4, 4])).toEqual([0, 0, 0])
    expect(fresnel0([0.8, 0.8, 0.8], 1)[0]).toBeGreaterThan(0.7)
    expect(fresnel0([0.8, 0.8, 0.8], 0)[0]).toBeLessThan(0.08)
    const point = sampleLight(defaultLights()[1], [0, 0.4, 1])
    expect(point?.intensity).toBeGreaterThan(0)
    const result = new UesLightCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.lumen).toBe(false)
    expect(result.verification.pathTraced).toBe(false)
  })
})
