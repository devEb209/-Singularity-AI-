export const sphAdapter = () => ({
  format: 'ues-fnws-sph-adapter-v1' as const,
  status: 'ADAPTER_AVAILABLE' as const,
  implemented: false,
  gpu: false,
  particles: 0,
  reason: 'GPU SPH remains an adapter; heightfield FNWS is the operational V1 solver',
})
