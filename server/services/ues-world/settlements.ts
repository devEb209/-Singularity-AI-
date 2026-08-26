import { inBounds, rng } from '../ues-shared/math.js'
import type { Building, BuildingKind, RoadGraph, Settlement, Terrain } from './types.js'

const kinds: BuildingKind[] = ['house', 'house', 'house', 'farm', 'market', 'clinic', 'workshop', 'keep']

export const generateSettlements = (terrain: Terrain, roads: RoadGraph): Settlement[] => {
  const random = rng(terrain.seed ^ 0x2a11)
  const occupied = roads.cells.map(row => row.slice())
  return roads.nodes.filter(node => node.kind === 'settlement').map((node, index) => {
    const radius = 3
    const buildings: Building[] = []
    for (let dz = -radius; dz <= radius; dz++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = node.x + dx
        const z = node.z + dz
        if (!inBounds(x, z, terrain.size)) continue
        if (occupied[z][x]) continue
        if (terrain.biomes[z][x] === 'alpine' || terrain.biomes[z][x] === 'wetland') continue
        if (Math.hypot(dx, dz) < 0.5) continue
        if (random() > 0.55) continue
        const kind = kinds[Math.floor(random() * kinds.length)]
        occupied[z][x] = true
        buildings.push({
          id: `b-${index}-${buildings.length}`,
          kind,
          x,
          z,
          width: 1,
          depth: 1,
          floors: kind === 'keep' ? 3 : kind === 'house' ? 1 : 2,
          settlementId: node.id,
        })
      }
    }
    if (!buildings.some(item => item.kind === 'clinic')) {
      const slot = buildings[0]
      if (slot) slot.kind = 'clinic'
    }
    return {
      id: node.id,
      name: `Settlement ${index + 1}`,
      cx: node.x,
      cz: node.z,
      radius,
      buildings,
    }
  })
}

export const buildingMask = (terrain: Terrain, settlements: Settlement[]) => {
  const mask = Array.from({ length: terrain.size }, () => Array.from({ length: terrain.size }, () => false))
  for (const settlement of settlements) {
    for (const building of settlement.buildings) mask[building.z][building.x] = true
  }
  return mask
}
