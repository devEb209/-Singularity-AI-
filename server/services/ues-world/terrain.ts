import { clamp, hashSeed, rng } from '../ues-shared/math.js'
import type { Biome, Terrain } from './types.js'

export const generateTerrain = (seedText: string, size = 32): Terrain => {
  const sizeSafe = clamp(Math.floor(size), 8, 64)
  const seed = hashSeed(seedText)
  const random = rng(seed)
  const heights: number[][] = []
  const biomes: Biome[][] = []
  const slopes: number[][] = []
  for (let z = 0; z < sizeSafe; z++) {
    const heightRow: number[] = []
    const biomeRow: Biome[] = []
    for (let x = 0; x < sizeSafe; x++) {
      const wave = Math.sin((x + seed % 17) * 0.31) + Math.cos((z + seed % 23) * 0.27)
      const ridge = Math.sin((x + z) * 0.11) * 0.8
      const height = Number((wave * 2.4 + ridge + (random() - 0.5) * 1.1).toFixed(3))
      heightRow.push(height)
      biomeRow.push(height > 2.6 ? 'alpine' : height < -0.85 ? 'wetland' : random() > 0.68 ? 'forest' : 'grassland')
    }
    heights.push(heightRow)
    biomes.push(biomeRow)
  }
  for (let z = 0; z < sizeSafe; z++) {
    const row: number[] = []
    for (let x = 0; x < sizeSafe; x++) {
      const h = heights[z][x]
      const dx = heights[z][Math.min(sizeSafe - 1, x + 1)] - h
      const dz = heights[Math.min(sizeSafe - 1, z + 1)][x] - h
      row.push(Number(Math.hypot(dx, dz).toFixed(4)))
    }
    slopes.push(row)
  }
  return {
    format: 'ues-terrain-v1',
    seed,
    size: sizeSafe,
    chunkSize: 8,
    heights,
    biomes,
    slopes,
    verification: {
      finite: heights.flat().every(Number.isFinite) && slopes.flat().every(Number.isFinite),
      dimensions: [sizeSafe, sizeSafe],
      slopeFinite: slopes.flat().every(value => value >= 0),
    },
  }
}
