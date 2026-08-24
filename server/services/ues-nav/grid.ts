import type { RoadGraph, Settlement, Terrain } from '../ues-world/types.js'
import type { NavGrid } from './types.js'

export const buildNavGrid = (terrain: Terrain, roads: RoadGraph, settlements: Settlement[]): NavGrid => {
  const buildings = new Set(settlements.flatMap(item => item.buildings.map(building => `${building.x},${building.z}`)))
  const walkable = terrain.biomes.map((row, z) => row.map((biome, x) => {
    if (buildings.has(`${x},${z}`)) return false
    if (biome === 'alpine' && terrain.slopes[z][x] > 1.4) return false
    return true
  }))
  const cost = terrain.slopes.map((row, z) => row.map((slope, x) => {
    const road = roads.cells[z][x] ? 0.35 : 1
    const wet = terrain.biomes[z][x] === 'wetland' ? 1.8 : 1
    return Number((road * wet * (1 + slope * 1.6)).toFixed(3))
  }))
  const walkableCells = walkable.flat().filter(Boolean).length
  return {
    size: terrain.size,
    walkable,
    cost,
    verification: { walkableCells, isolated: walkableCells < terrain.size },
  }
}
