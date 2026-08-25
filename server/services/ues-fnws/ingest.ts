import { fixtureLayers } from '../ues-gis/fixture.js'
import { heightField } from '../ues-planet/height.js'
import { hashSeed } from '../ues-shared/math.js'

export interface HydroLayers {
  heights: number[][]
  precipitation: number[][]
  drainage: number[][]
  source: 'internal-geophysics' | 'licensed-fixture' | 'remote-adapter'
  fetchedRemote: false
}

export const layersFromSeed = (seedText: string): HydroLayers => {
  const heights = heightField(hashSeed(seedText), 36)
  return {
    heights,
    precipitation: heights.map(row => row.map(height => (height > 0 ? 0.02 : 0))),
    drainage: heights.map(row => row.map(height => (height > 0 ? 0.4 : 0.15))),
    source: 'internal-geophysics',
    fetchedRemote: false,
  }
}

export const layersFromFixture = (): HydroLayers => {
  const fields = fixtureLayers()
  const heights = fields.find(item => item.kind === 'height')!.cells
  const hydro = fields.find(item => item.kind === 'hydro')!.cells
  return {
    heights,
    precipitation: hydro.map(row => row.map(value => (value > 0 && value < 0.2 ? 0.03 : 0.01))),
    drainage: hydro.map(row => row.map(value => Math.min(0.8, 0.2 + value))),
    source: 'licensed-fixture',
    fetchedRemote: false,
  }
}

export const rainAmount = (layers: HydroLayers) => {
  const flat = layers.precipitation.flat()
  return flat.reduce((sum, value) => sum + value, 0) / Math.max(1, flat.length)
}
