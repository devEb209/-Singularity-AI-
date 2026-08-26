import { composeReality } from './compose.js'
import { centerOf } from './extent.js'
import { displaceByWind, windVector } from './wind.js'
import type { RealityNode } from './types.js'

export const stepWeather = (nodes: RealityNode[], dt = 1) => {
  const wind = windVector(nodes)
  const next = nodes.map(node => (node.id === 'cloud' ? displaceByWind(node, wind, dt) : node))
  const before = nodes.find(item => item.id === 'cloud')
  const after = next.find(item => item.id === 'cloud')
  const moved = before && after ? Math.hypot(
    centerOf(after)[0] - centerOf(before)[0],
    centerOf(after)[1] - centerOf(before)[1],
    centerOf(after)[2] - centerOf(before)[2],
  ) : 0
  return {
    nodes: next,
    wind,
    moved,
    shaderWeather: false as const,
    particleSystem: false as const,
  }
}

export const compareWeather = (prompt = 'oceano salgado sob céu nublado') => {
  const composed = composeReality(prompt)
  const weather = stepWeather(composed.nodes, 1)
  return {
    moved: weather.moved,
    cloudMoved: weather.moved > 1e-6,
    wind: weather.wind,
    shaderWeather: weather.shaderWeather,
    particleSystem: weather.particleSystem,
  }
}
