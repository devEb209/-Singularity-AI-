type GpuLike = {
  requestAdapter?: () => Promise<{ requestDevice?: () => Promise<unknown> } | null>
}

export const probeWebGpuSync = () => {
  const gpu = (globalThis as { navigator?: { gpu?: GpuLike } }).navigator?.gpu
  return {
    available: Boolean(gpu),
    canRequestAdapter: typeof gpu?.requestAdapter === 'function',
    requested: false,
    device: false,
    note: gpu
      ? 'WebGPU object present; requestAdapter is the real hardware path'
      : 'No navigator.gpu in this process; CPU radiance/raster is the executing fallback',
  }
}

export const probeWebGpu = async () => {
  const gpu = (globalThis as { navigator?: { gpu?: GpuLike } }).navigator?.gpu
  if (!gpu?.requestAdapter) {
    return { available: false, requested: false, device: false, reason: 'no-navigator-gpu' as const }
  }
  try {
    const adapter = await gpu.requestAdapter()
    if (!adapter) return { available: false, requested: true, device: false, reason: 'no-adapter' as const }
    if (!adapter.requestDevice) return { available: true, requested: true, device: false, reason: 'no-device-api' as const }
    await adapter.requestDevice()
    return { available: true, requested: true, device: true, reason: 'device' as const }
  } catch {
    return { available: false, requested: true, device: false, reason: 'request-failed' as const }
  }
}
