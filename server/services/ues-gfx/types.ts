export type GfxBackend = 'cpu-json' | 'webgl' | 'vulkan' | 'directx' | 'metal' | 'opengl'

export type GfxOpcode = 'Clear' | 'SetView' | 'BindMaterial' | 'SetLod' | 'DrawMesh' | 'DrawInstance'

export interface GfxCommand {
  op: GfxOpcode
  target?: string
  lod?: number
  instances?: number
  material?: string
}

export interface GfxBackendState {
  id: GfxBackend
  status: 'IMPLEMENTADO' | 'ADAPTER DISPONÍVEL' | 'PARCIAL'
  ownsPresentation: boolean
}
