export const detectGpuBackend = () => {
  const nav = (globalThis as { navigator?: { gpu?: unknown } }).navigator
  const available = Boolean(nav?.gpu)
  return {
    format: 'ues-gpu-detect-v1' as const,
    available,
    backend: available ? 'webgpu' as const : 'cpu-raster' as const,
    role: available ? 'hardware' as const : 'fallback' as const,
    note: available
      ? 'WebGPU device present; UES can compile IR to it'
      : 'No WebGPU in this process; CPU raster/compute is the executing fallback',
  }
}
