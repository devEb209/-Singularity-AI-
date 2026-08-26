import { composeWithStructures } from './structure.js'
import { observedLuminance, solarSpectrum } from './spectrum.js'
import { scatterSpectrum } from './matter.js'

export const albedoOf = (substanceId: string, path = 0.4) => {
  const reflected = scatterSpectrum(substanceId, path, solarSpectrum(), 0)
  return observedLuminance(reflected, 'human-photopic')
}

export const compareAlbedo = () => {
  const snow = albedoOf('H2O', 0.05)
  const soil = albedoOf('SiO2', 0.4)
  const forest = albedoOf('C6H10O5', 0.5)
  return {
    snowBrighter: snow > soil && snow > forest,
    pbr: false as const,
    textureAlbedo: false as const,
    composed: composeWithStructures('neve alpina no cume').nodes.some(item => item.id === 'ocean'),
  }
}
