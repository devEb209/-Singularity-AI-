import type { ObserverKind, SpectrumBand } from './types.js'
import { spectrumBands } from './types.js'

export const emptySpectrum = (): Record<SpectrumBand, number> =>
  Object.fromEntries(spectrumBands.map(band => [band, 0])) as Record<SpectrumBand, number>

export const solarSpectrum = (): Record<SpectrumBand, number> => ({
  uv: 0.35,
  violet: 0.55,
  blue: 0.85,
  green: 1,
  yellow: 0.95,
  red: 0.8,
  nir: 0.7,
  fir: 0.25,
})

export const observerWeights = (kind: ObserverKind): Record<SpectrumBand, number> => {
  if (kind === 'thermal-ir') return { uv: 0, violet: 0, blue: 0, green: 0, yellow: 0, red: 0.05, nir: 0.35, fir: 1 }
  if (kind === 'insect-uv') return { uv: 1, violet: 0.7, blue: 0.4, green: 0.2, yellow: 0.05, red: 0, nir: 0, fir: 0 }
  if (kind === 'camera-srgb') return { uv: 0.02, violet: 0.15, blue: 0.9, green: 1, yellow: 0.7, red: 0.85, nir: 0.08, fir: 0 }
  return { uv: 0, violet: 0.08, blue: 0.55, green: 1, yellow: 0.75, red: 0.45, nir: 0, fir: 0 }
}

export const observedLuminance = (spectrum: Record<SpectrumBand, number>, kind: ObserverKind) => {
  const weights = observerWeights(kind)
  return spectrumBands.reduce((sum, band) => sum + spectrum[band] * weights[band], 0)
}
