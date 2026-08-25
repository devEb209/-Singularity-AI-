import { requireSubstance } from './substances.js'
import type { Phase, SpectrumBand, Substance } from './types.js'
import { spectrumBands } from './types.js'

export const phaseAt = (substance: Substance, temperatureK: number): Phase => {
  if (temperatureK >= 8000) return 'plasma'
  if (temperatureK < substance.meltK) return 'solid'
  if (temperatureK < substance.boilK) return 'liquid'
  return 'gas'
}

export const beerLambert = (incident: number, absorption: number, path: number) =>
  incident * Math.exp(-Math.max(0, absorption) * Math.max(0, path))

export const mixAbsorption = (parts: { id: string; fraction: number }[], band: SpectrumBand) => {
  const total = parts.reduce((sum, part) => sum + part.fraction, 0) || 1
  return parts.reduce((sum, part) => sum + requireSubstance(part.id).optical.absorption[band] * (part.fraction / total), 0)
}

export const transmitSpectrum = (substanceId: string, path: number, incident: Record<SpectrumBand, number>) => {
  const substance = requireSubstance(substanceId)
  return Object.fromEntries(spectrumBands.map(band => [band, beerLambert(incident[band], substance.optical.absorption[band], path)])) as Record<SpectrumBand, number>
}

export const hasPbrLayers = (substance: Substance) =>
  !('roughness' in substance) && !('metalness' in substance) && !('albedo' in substance)
