import { describe, expect, it } from 'vitest'
import { heightField } from '../ues-planet/height.js'
import { hashSeed } from '../ues-shared/math.js'
import { UesTerrainNavCore } from './core.js'
import { walkableFromPlanet } from './heightmesh.js'

describe('UES planet heightfield navigation', () => {
  it('marks ocean as blocked and finds a land path', () => {
    const heights = heightField(hashSeed('earth-like'), 36)
    const layer = walkableFromPlanet(heights)
    expect(layer.cells).toBeGreaterThan(20)
    const oceanBlocked = heights.flatMap((row, z) => row.map((height, x) => height <= 0 ? !layer.walkable[z][x] : true))
    expect(oceanBlocked.every(Boolean)).toBe(true)
    const result = new UesTerrainNavCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.recast).toBe(false)
    expect(result.path.found).toBe(true)
  })
})
