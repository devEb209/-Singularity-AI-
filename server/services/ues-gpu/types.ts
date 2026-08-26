export type GpuBackend = 'cpu-compute' | 'webgpu' | 'vulkan' | 'directx' | 'opengl' | 'metal'

export type GpuStatus = 'IMPLEMENTADO' | 'ADAPTER DISPONÍVEL' | 'PARCIAL'

export interface GpuBuffer {
  id: string
  kind: 'vertex' | 'index' | 'uniform' | 'storage' | 'indirect'
  floats: number[]
}

export interface GpuTexture {
  id: string
  width: number
  height: number
  pixels: number[]
}

export type GpuOp =
  | { op: 'CreateBuffer'; buffer: GpuBuffer }
  | { op: 'CreateTexture'; texture: GpuTexture }
  | { op: 'DispatchCompute'; kernel: 'cull' | 'gerstner' | 'pbr' | 'indirect'; groups: number }
  | { op: 'BeginRenderPass'; pass: string }
  | { op: 'DrawIndirect'; count: number }
  | { op: 'Barrier'; after: string; before: string }
  | { op: 'EndRenderPass' }

export interface GpuBackendState {
  id: GpuBackend
  status: GpuStatus
  compute: boolean
  presentation: boolean
}
