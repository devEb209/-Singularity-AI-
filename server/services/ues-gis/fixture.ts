import { hashSeed } from '../ues-shared/math.js'
import { biomeAt } from '../ues-planet/biome.js'
import { climateField } from '../ues-planet/climate.js'
import { rockAt } from '../ues-planet/geology.js'
import { heightField } from '../ues-planet/height.js'
import { accumulate, rivers } from '../ues-planet/hydrology.js'
import type { SpatialDataset } from '../ues-space/types.js'

const SIZE = 16

export const fixtureLayers = (seedText = 'licensed-public-sample'): SpatialDataset[] => {
  const seed = hashSeed(seedText)
  const heights = heightField(seed, SIZE)
  const hydro = accumulate(heights)
  const riverCells = rivers(heights, hydro.acc, 4)
  const riverMask = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => false))
  for (const [x, z] of riverCells) riverMask[z][x] = true
  const climate = climateField(heights, riverMask)
  const hydroCells = heights.map((row, z) => row.map((height, x) => {
    if (height <= 0) return Number((-height).toFixed(5))
    return riverMask[z][x] ? 0.08 : 0
  }))
  const biomeCells = climate.map((row, z) => row.map((cell, x) => {
    const biome = biomeAt(heights[z][x], cell.temperature, cell.moisture)
    return biome === 'ocean' ? 0 : biome === 'desert' ? 0.2 : biome === 'forest' ? 0.8 : 0.5
  }))
  const geologyCells = climate.map((row, z) => row.map((cell, x) => {
    const rock = rockAt(heights[z][x], cell.temperature)
    return rock === 'basalt' ? 0.8 : rock === 'granite' ? 0.6 : 0.3
  }))
  const pack = (kind: SpatialDataset['kind'], cells: number[][]): SpatialDataset => ({
    id: `fixture-${kind}`,
    kind,
    size: SIZE,
    cells,
    license: 'CC0',
    source: 'internal-fixture',
    fetchedRemote: false,
  })
  return [
    pack('height', heights),
    pack('hydro', hydroCells),
    pack('climate', climate.map(row => row.map(cell => cell.temperature))),
    pack('biome', biomeCells),
    pack('geology', geologyCells),
  ]
}
