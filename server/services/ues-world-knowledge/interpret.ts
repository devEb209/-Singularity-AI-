export interface FieldSample {
  elevation: number
  moisture: number
  temperature: number
  latitude: number
}

export interface WorldLaws {
  treeLine: number
  desertMoisture: number
  iceTemp: number
}

export const earthLaws: WorldLaws = { treeLine: 0.72, desertMoisture: 0.22, iceTemp: 0.28 }

export const interpretCell = (sample: FieldSample, laws: WorldLaws = earthLaws) => {
  if (sample.temperature < laws.iceTemp) return { biome: 'ice', soil: 'permafrost', hydro: 'frozen', vegetation: 'sparse' }
  if (sample.moisture < laws.desertMoisture) return { biome: 'desert', soil: 'sand', hydro: 'ephemeral', vegetation: 'xerophyte' }
  if (sample.elevation > laws.treeLine) return { biome: 'alpine', soil: 'rock', hydro: 'snowmelt', vegetation: 'tundra' }
  if (Math.abs(sample.latitude) < 0.2 && sample.moisture > 0.5) return { biome: 'rainforest', soil: 'laterite', hydro: 'river', vegetation: 'canopy' }
  if (sample.moisture > 0.65 && sample.elevation < 0.15) return { biome: 'wetland', soil: 'peat', hydro: 'standing', vegetation: 'reed' }
  return { biome: 'temperate', soil: 'loam', hydro: 'stream', vegetation: 'mixed' }
}

export const interpretGrid = (samples: FieldSample[], laws: WorldLaws = earthLaws) => {
  const cells = samples.map(sample => interpretCell(sample, laws))
  const biomes = [...new Set(cells.map(item => item.biome))]
  return { cells, biomes, laws: laws === earthLaws ? 'earth-reference' : 'custom' }
}
