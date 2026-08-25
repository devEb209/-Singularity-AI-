import { describe, expect, it } from 'vitest'
import { UesNavmeshCore } from './core.js'
import { funnel, polylineLength, portalsFromPath } from './funnel.js'
import { fillAabb, roomWithObstacle, voxelize } from './voxel.js'
import { walkableLayer, worldToCell } from './walkable.js'

describe('UES voxel navmesh', () => {
  it('marks a walkable ring around the obstacle and finds a corner-to-corner path', () => {
    const voxels = fillAabb(voxelize(roomWithObstacle()), [-0.7, 0, -0.7], [0.7, 1.2, 0.7])
    const layer = walkableLayer(voxels)
    expect(layer.cells).toBeGreaterThan(40)
    const blocked = worldToCell(voxels, 0, 0)
    expect(layer.walkable[blocked[1]][blocked[0]]).toBe(false)
    const compiled = new UesNavmeshCore().compile()
    expect(compiled.path.found).toBe(true)
    expect(compiled.verification.valid).toBe(true)
    expect(compiled.verification.recast).toBe(false)
  })

  it('shortens a dogleg corridor with the funnel algorithm', () => {
    const corridor: [number, number][] = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]
    const pulled = funnel(corridor[0], portalsFromPath(corridor), corridor[corridor.length - 1])
    expect(polylineLength(pulled)).toBeLessThanOrEqual(polylineLength(corridor) + 1e-6)
    expect(pulled.length).toBeGreaterThanOrEqual(2)
  })
})
