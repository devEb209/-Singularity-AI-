export type SpatialAdapterId = 'synthetic' | 'local-fixture' | 'ogc-tiles' | 'google-photoreal' | 'nasa-science'

export interface SpatialAdapter {
  id: SpatialAdapterId
  executable: boolean
  required: boolean
  status: 'IMPLEMENTADO' | 'ADAPTER DISPONÍVEL'
}

export const spatialAdapters: SpatialAdapter[] = [
  { id: 'synthetic', executable: true, required: false, status: 'IMPLEMENTADO' },
  { id: 'local-fixture', executable: true, required: false, status: 'IMPLEMENTADO' },
  { id: 'ogc-tiles', executable: false, required: false, status: 'ADAPTER DISPONÍVEL' },
  { id: 'google-photoreal', executable: false, required: false, status: 'ADAPTER DISPONÍVEL' },
  { id: 'nasa-science', executable: false, required: false, status: 'ADAPTER DISPONÍVEL' },
]
