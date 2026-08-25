import { composeReality } from './compose.js'
import { experienceAt } from './observer.js'
import type { RealityNode } from './types.js'

export const sunElevation = (hour: number) => {
  if (hour < 6 || hour >= 18) return 0
  return Math.sin(((hour - 6) / 12) * Math.PI)
}

export const applyCircadian = (nodes: RealityNode[], hour: number) => {
  const elevation = sunElevation(hour)
  return nodes.map(node => {
    if (node.id === 'star-sol') return { ...node, emissionScale: 0.12 + elevation * 0.88 }
    if (node.id === 'ocean' || node.id === 'soil' || node.id === 'atmosphere' || node.id === 'terrain') {
      return { ...node, temperatureK: node.temperatureK + (elevation - 0.5) * 8 }
    }
    return node
  })
}

export const compareDayNight = (prompt = 'oceano salgado com fogo') => {
  const composed = composeReality(prompt)
  const noon = applyCircadian(composed.nodes, 12)
  const night = applyCircadian(composed.nodes, 2)
  const noonOcean = noon.find(item => item.id === 'ocean')!.temperatureK
  const nightOcean = night.find(item => item.id === 'ocean')!.temperatureK
  const noonLight = experienceAt(noon).light.luminance
  const nightStar = night.find(item => item.id === 'star-sol')!.emissionScale
  const noonStar = noon.find(item => item.id === 'star-sol')!.emissionScale
  return {
    noonOcean,
    nightOcean,
    nightColder: nightOcean < noonOcean,
    noonStar,
    nightStar,
    starDimmerAtNight: nightStar < noonStar,
    noonLight,
    skybox: false as const,
    shaderDayNight: false as const,
  }
}
