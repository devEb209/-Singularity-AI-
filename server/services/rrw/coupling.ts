import { transmitSpectrum } from './matter.js'
import { observedLuminance, solarSpectrum } from './spectrum.js'
import type { ObserverKind, SpectrumBand } from './types.js'
import { spectrumBands } from './types.js'

export interface CouplingPath {
  sourceEmission: Record<SpectrumBand, number>
  media: { substanceId: string; path: number }[]
  observer: ObserverKind
}

export const transport = (path: CouplingPath) => {
  let spectrum = { ...path.sourceEmission }
  for (const segment of path.media) spectrum = transmitSpectrum(segment.substanceId, segment.path, spectrum)
  return {
    spectrum,
    luminance: observedLuminance(spectrum, path.observer),
    bands: spectrumBands.length,
    rayTraced: false,
    pathTraced: false,
    pbr: false,
  }
}

export const compareMedia = (observer: ObserverKind = 'human-photopic') => {
  const source = solarSpectrum()
  const air = transport({ sourceEmission: source, media: [{ substanceId: 'N2', path: 8 }], observer })
  const water = transport({ sourceEmission: source, media: [{ substanceId: 'H2O', path: 8 }], observer })
  const gold = transport({ sourceEmission: source, media: [{ substanceId: 'Au', path: 0.08 }], observer })
  return { air, water, gold }
}
