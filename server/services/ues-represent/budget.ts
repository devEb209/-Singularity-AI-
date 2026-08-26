import type { HardwareTier } from './types.js'

export const deviceBudget = (tier: HardwareTier) => {
  if (tier === 'low') return { draw: 24, simulate: 16, resident: 12, sample: 16 }
  if (tier === 'high') return { draw: 96, simulate: 64, resident: 48, sample: 64 }
  return { draw: 48, simulate: 32, resident: 24, sample: 32 }
}

export const perceptualFloor = (tier: HardwareTier) => (tier === 'low' ? 0.72 : tier === 'high' ? 0.9 : 0.82)
