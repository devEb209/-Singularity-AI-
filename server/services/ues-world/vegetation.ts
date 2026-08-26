import { rng } from '../ues-shared/math.js'
import type { Terrain, VegetationInstance } from './types.js'

export const generateVegetation = (terrain: Terrain, blocked: boolean[][]): VegetationInstance[] => {
  const random = rng(terrain.seed ^ 0x77e1)
  const plants: VegetationInstance[] = []
  for (let z = 0; z < terrain.size; z++) {
    for (let x = 0; x < terrain.size; x++) {
      if (blocked[z][x]) continue
      const biome = terrain.biomes[z][x]
      const roll = random()
      if (biome === 'forest' && roll < 0.42) {
        plants.push({ id: `veg-${x}-${z}`, kind: 'tree', x, z, height: 4 + random() * 4 })
      } else if (biome === 'grassland' && roll < 0.08) {
        plants.push({ id: `veg-${x}-${z}`, kind: 'shrub', x, z, height: 1 + random() })
      } else if (biome === 'wetland' && roll < 0.22) {
        plants.push({ id: `veg-${x}-${z}`, kind: 'reed', x, z, height: 1.4 + random() })
      } else if (biome === 'alpine' && roll < 0.05) {
        plants.push({ id: `veg-${x}-${z}`, kind: 'rock', x, z, height: 0.6 + random() })
      }
    }
  }
  return plants
}
