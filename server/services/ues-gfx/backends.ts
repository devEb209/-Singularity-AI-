import type { GfxBackendState } from './types.js'

export const gfxBackends: GfxBackendState[] = [
  { id: 'cpu-json', status: 'IMPLEMENTADO', ownsPresentation: false },
  { id: 'webgl', status: 'PARCIAL', ownsPresentation: true },
  { id: 'vulkan', status: 'ADAPTER DISPONÍVEL', ownsPresentation: true },
  { id: 'directx', status: 'ADAPTER DISPONÍVEL', ownsPresentation: true },
  { id: 'metal', status: 'ADAPTER DISPONÍVEL', ownsPresentation: true },
  { id: 'opengl', status: 'ADAPTER DISPONÍVEL', ownsPresentation: true },
]
