import type { SpatialDataset, SpatialKind } from '../ues-space/types.js'
import type { NormalizedField } from './types.js'

const stats = (cells: number[][]) => {
  const flat = cells.flat()
  const min = Math.min(...flat)
  const max = Math.max(...flat)
  const mean = flat.reduce((sum, value) => sum + value, 0) / Math.max(1, flat.length)
  const landRatio = flat.filter(value => value > 0).length / Math.max(1, flat.length)
  return { min, max, mean, landRatio }
}

export const normalizeDataset = (dataset: SpatialDataset): NormalizedField => {
  const summary = stats(dataset.cells)
  return {
    kind: dataset.kind,
    size: dataset.size,
    min: Number(summary.min.toFixed(5)),
    max: Number(summary.max.toFixed(5)),
    mean: Number(summary.mean.toFixed(5)),
    landRatio: Number(summary.landRatio.toFixed(4)),
    dataset,
  }
}

export const emptyField = (kind: SpatialKind, size: number, source: string): SpatialDataset => ({
  id: `${source}-${kind}`,
  kind,
  size,
  cells: Array.from({ length: size }, () => Array.from({ length: size }, () => 0)),
  license: 'CC0',
  source,
  fetchedRemote: false,
})

export const combineKnowledge = (fields: NormalizedField[]) => {
  const height = fields.find(item => item.kind === 'height')
  const hydro = fields.find(item => item.kind === 'hydro')
  return {
    layers: fields.map(item => item.kind),
    landRatio: height?.landRatio ?? 0,
    hydroMean: hydro?.mean ?? 0,
    photogrammetryOnly: false,
    structuredKnowledge: true,
  }
}
