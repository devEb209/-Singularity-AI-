import { describe, expect, it } from 'vitest'
import { booleanSolids, defaultPair } from './csg.js'
import { UesSolidCore } from './core.js'
import { loftProfiles, sweepPolyline } from './loft.js'
import { unwrapBox } from './unwrap.js'

describe('UES constructive solid geometry', () => {
  it('obeys boolean volume inequalities and builds loft/sweep/UV without claiming image-to-3D', () => {
    const pair = defaultPair()
    const sub = booleanSolids(pair.left, pair.right, 'subtract')
    const uni = booleanSolids(pair.left, pair.right, 'union')
    const inter = booleanSolids(pair.left, pair.right, 'intersect')
    expect(sub.counts.result).toBeLessThan(sub.counts.left)
    expect(uni.counts.result).toBeGreaterThanOrEqual(Math.max(uni.counts.left, uni.counts.right))
    expect(inter.counts.result).toBeLessThanOrEqual(Math.min(inter.counts.left, inter.counts.right))
    expect(sub.geometry.triangles.length).toBeGreaterThan(0)
    const loft = loftProfiles({ y: 0, hx: 0.4, hz: 0.2 }, { y: 1, hx: 0.2, hz: 0.1 })
    expect(loft.vertices).toHaveLength(8)
    expect(loft.triangles.length).toBeGreaterThanOrEqual(12)
    expect(unwrapBox(loft).verification.valid).toBe(true)
    expect(sweepPolyline([[0, 0, 0], [1, 0, 0], [1, 0, 1]]).triangles.length).toBeGreaterThan(0)
    const result = new UesSolidCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.imageTo3d).toBe(false)
  })
})
