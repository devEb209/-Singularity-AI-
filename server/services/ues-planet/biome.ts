export type PlanetBiome = 'ocean' | 'alpine' | 'tundra' | 'desert' | 'grassland' | 'forest' | 'wetland'

export const biomeAt = (height: number, temperature: number, moisture: number): PlanetBiome => {
  if (height <= 0) return 'ocean'
  if (height > 0.85) return 'alpine'
  if (temperature < -2) return 'tundra'
  if (moisture < 0.28 && temperature > 12) return 'desert'
  if (moisture > 0.72 && temperature > 8) return height < 0.12 ? 'wetland' : 'forest'
  return 'grassland'
}
