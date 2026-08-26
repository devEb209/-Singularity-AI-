export type SpatialKind = 'height' | 'geology' | 'climate' | 'biome' | 'hydro'

export interface SpatialDataset {
  id: string
  kind: SpatialKind
  size: number
  cells: number[][]
  license: 'CC0' | 'Apache-2.0' | 'unknown' | 'all-rights-reserved'
  source: string
  fetchedRemote: false
}

export interface LatLon {
  lat: number
  lon: number
}
