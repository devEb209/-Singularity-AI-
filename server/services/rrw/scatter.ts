import { scatterSpectrum } from './matter.js'
import { observedLuminance, solarSpectrum } from './spectrum.js'
import { spectrumBands } from './types.js'

export const scatterThrough = (substanceId: string, path: number, extraScatter = 0) => {
  const spectrum = scatterSpectrum(substanceId, path, solarSpectrum(), extraScatter)
  return {
    spectrum,
    luminance: observedLuminance(spectrum, 'human-photopic'),
    bands: spectrumBands.length,
    rayTraced: false as const,
    pathTraced: false as const,
    pbr: false as const,
  }
}

export const compareScatter = () => {
  const air = scatterThrough('N2', 8, 0)
  const cloud = scatterThrough('H2O', 8, 0.45)
  return {
    air,
    cloud,
    cloudDimmer: cloud.luminance < air.luminance,
    rayTraced: false as const,
    pathTraced: false as const,
    shaderFog: false as const,
  }
}
