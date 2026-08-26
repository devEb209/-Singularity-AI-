import { speedOfSound } from './acoustics.js'
import { requireSubstance } from './substances.js'

export type WaveKind = 'acoustic' | 'surface' | 'electromagnetic'

export const waveSpeed = (kind: WaveKind, substanceId: string, temperatureK: number) => {
  if (kind === 'electromagnetic') return 299_792_458 / requireSubstance(substanceId).refractiveIndex
  if (kind === 'surface') return substanceId === 'H2O' ? Math.sqrt(9.81 * 2) : 1
  return speedOfSound(substanceId, temperatureK)
}

export const propagate = (kind: WaveKind, substanceId: string, temperatureK: number, frequencyHz: number, distance: number) => {
  const speed = waveSpeed(kind, substanceId, temperatureK)
  const wavelength = speed / Math.max(1e-6, frequencyHz)
  const absorption = kind === 'electromagnetic'
    ? requireSubstance(substanceId).optical.absorption.red * 0.1
    : requireSubstance(substanceId).optical.absorption.fir * 0.02
  return {
    kind,
    speed,
    wavelength,
    period: 1 / Math.max(1e-6, frequencyHz),
    attenuation: Math.exp(-absorption * Math.max(0, distance)),
    seconds: distance / Math.max(1e-9, speed),
    shaderWave: false as const,
  }
}

export const compareSoundMedia = () => {
  const air = propagate('acoustic', 'N2', 293, 440, 10)
  const water = propagate('acoustic', 'H2O', 293, 440, 10)
  return { air, water, waterFaster: water.speed > air.speed }
}
