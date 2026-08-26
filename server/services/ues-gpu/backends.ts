import type { GpuBackendState } from './types.js'

export const gpuBackends: GpuBackendState[] = [
  { id: 'cpu-compute', status: 'IMPLEMENTADO', compute: true, presentation: false },
  { id: 'webgpu', status: 'ADAPTER DISPONÍVEL', compute: true, presentation: true },
  { id: 'vulkan', status: 'ADAPTER DISPONÍVEL', compute: true, presentation: true },
  { id: 'directx', status: 'ADAPTER DISPONÍVEL', compute: true, presentation: true },
  { id: 'opengl', status: 'ADAPTER DISPONÍVEL', compute: true, presentation: true },
  { id: 'metal', status: 'ADAPTER DISPONÍVEL', compute: true, presentation: true },
]
