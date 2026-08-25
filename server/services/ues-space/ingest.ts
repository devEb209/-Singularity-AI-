import { rightsVerdict } from '../ues-reference/rights.js'
import type { SpatialDataset } from './types.js'

export const ingestSpatial = (dataset: SpatialDataset) => {
  const verdict = rightsVerdict([{
    id: dataset.id,
    title: dataset.source,
    kind: 'license',
    license: dataset.license,
    source: dataset.source,
    values: { kind: dataset.kind },
  }])
  const finite = dataset.cells.flat().every(Number.isFinite)
  const square = dataset.cells.length === dataset.size && dataset.cells.every(row => row.length === dataset.size)
  return {
    format: 'ues-spatial-ingest-v1' as const,
    knowledge: 'spatial-3d-rules-not-2d-map',
    fetchedRemote: false,
    nasa: false,
    verdict,
    verification: { valid: verdict.allowed && finite && square && dataset.cells.length > 0, vision: false },
  }
}
