import { applyCircadian } from './circadian.js'
import { composeReality } from './compose.js'
import { experienceAt } from './observer.js'
import { climateBaseOf, applyTimeClimate } from './season.js'

export const observeSpan = (prompt = 'oceano salgado com fogo') => {
  const composed = composeReality(prompt)
  const noon = applyCircadian(composed.nodes, 12)
  const night = applyCircadian(composed.nodes, 2)
  const noonStar = noon.find(item => item.id === 'star-sol')!.emissionScale
  const nightStar = night.find(item => item.id === 'star-sol')!.emissionScale
  const noonLight = experienceAt(noon).light.luminance * noonStar
  const nightLight = experienceAt(night).light.luminance * nightStar
  const base = climateBaseOf(composed.nodes)
  const winter = applyTimeClimate(composed.nodes, base, { hour: 12, dayOfYear: 15, moon: 0 })
  const summer = applyTimeClimate(composed.nodes, base, { hour: 12, dayOfYear: 200, moon: 0 })
  return {
    noonLight,
    nightLight,
    nightDimmer: nightLight < noonLight,
    winterOcean: winter.find(item => item.id === 'ocean')!.temperatureK,
    summerOcean: summer.find(item => item.id === 'ocean')!.temperatureK,
    framebufferFoundation: false as const,
    shaderDayNight: false as const,
  }
}
