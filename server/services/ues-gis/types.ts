import type { SpatialDataset, SpatialKind } from '../ues-space/types.js'

export type GisStatus = 'IMPLEMENTED' | 'ADAPTER_AVAILABLE' | 'EXTERNAL_DEPENDENCY' | 'PLANNED' | 'NOT_IMPLEMENTED'

export type GisAuth = 'none' | 'api-key' | 'oauth' | 'earthdata-token'

export interface GisSource {
  id: string
  name: string
  family: 'ogc-3d-tiles' | 'photorealistic-tiles' | 'cesium' | 'nasa-earthdata' | 'usgs' | 'opentopography' | 'geojson' | 'internal'
  homepage: string
  kinds: SpatialKind[]
  licenseHint: string
  auth: GisAuth
  status: GisStatus
  vendorLock: false
  fetchedRemote: false
}

export interface GisCredentials {
  sourceId: string
  present: boolean
  kind: GisAuth
}

export interface NormalizedField {
  kind: SpatialKind
  size: number
  min: number
  max: number
  mean: number
  landRatio: number
  dataset: SpatialDataset
}

export interface GisIngestResult {
  format: 'ues-gis-ingest-v1'
  sourceId: string
  status: GisStatus
  fetchedRemote: false
  nasa: false
  google: false
  cesium: false
  fields: NormalizedField[]
  knowledge: 'spatial-3d-rules-not-2d-map'
  dThesis: { selected: string[]; gpp: number }
  verification: { valid: boolean; liveRemote: false; proprietaryCopy: false }
  limitations: string[]
}
