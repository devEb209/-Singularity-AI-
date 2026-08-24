import { probeWebGpuSync } from './webgpu.js'

export const detectGpuBackend = () => {
  const probe = probeWebGpuSync()
  return {
    format: 'ues-gpu-detect-v1' as const,
    available: probe.available,
    canRequestAdapter: probe.canRequestAdapter,
    backend: probe.available ? 'webgpu' as const : 'cpu-raster' as const,
    role: probe.available ? 'hardware' as const : 'fallback' as const,
    note: probe.note,
  }
}
