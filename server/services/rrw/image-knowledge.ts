import { bumpImage } from '../ues-image3d/height.js'
import type { GrayImage } from '../ues-image/filters.js'
import { interpretMap, type TerrainSample } from './map-knowledge.js'

export const imageToTerrain = (image: GrayImage): TerrainSample[][] => {
  const grid: TerrainSample[][] = []
  for (let y = 0; y < image.height; y++) {
    const row: TerrainSample[] = []
    for (let x = 0; x < image.width; x++) {
      const lum = image.pixels[y * image.width + x] ?? 0
      row.push({ height: lum, moisture: 1 - lum })
    }
    grid.push(row)
  }
  return grid
}

export const interpretImageKnowledge = (image: GrayImage = bumpImage(8, 8)) => {
  const terrain = imageToTerrain(image)
  const knowledge = interpretMap(terrain)
  return {
    ...knowledge,
    width: image.width,
    height: image.height,
    learnedVision: false as const,
    meshFromImage: false as const,
    heightfieldIsIdentity: false as const,
  }
}
