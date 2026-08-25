import { requireSubstance } from './substances.js'
import type { RealityNode } from './types.js'

export const speedOfSound = (substanceId: string, temperatureK: number) => {
  if (substanceId === 'H2O') return temperatureK < 273.15 ? 3800 : 1403 + 4.2 * (temperatureK - 273.15)
  if (substanceId === 'N2' || substanceId === 'O2' || substanceId === 'H') return 331 + 0.6 * (temperatureK - 273.15)
  return 5000
}

export const acousticTravel = (from: [number, number, number], to: [number, number, number], medium: RealityNode) => {
  const substanceId = medium.substanceId ?? 'N2'
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2])
  const speed = speedOfSound(substanceId, medium.temperatureK)
  const absorption = requireSubstance(substanceId).optical.absorption.fir * 0.02
  return {
    distance,
    seconds: distance / Math.max(1, speed),
    attenuation: Math.exp(-absorption * distance),
    shaderAudio: false as const,
  }
}
