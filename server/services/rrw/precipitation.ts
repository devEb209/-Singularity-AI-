import { exchangeWater, waterMoles } from './exchange.js'
import { molesOf } from './extent.js'
import { composeWithStructures } from './structure.js'
import type { RealityNode } from './types.js'

export const stepPrecipitation = (nodes: RealityNode[]) => {
  const cloud = nodes.find(item => item.id === 'cloud')
  const vapor = cloud ? molesOf(cloud, 'H2O') : 0
  const rain = vapor > 2 ? Math.min(1.2, vapor * 0.08) : 0
  const exchanged = exchangeWater(nodes, rain, 0)
  return {
    ...exchanged,
    rained: rain > 0,
    rain,
    shaderRain: false as const,
    particleSystem: false as const,
  }
}

export const comparePrecipitation = (prompt = 'oceano salgado sob céu nublado') => {
  const composed = composeWithStructures(prompt)
  const before = waterMoles(composed.nodes)
  const stepped = stepPrecipitation(composed.nodes)
  return {
    rained: stepped.rained,
    conserved: stepped.conserved && Math.abs(stepped.after - before) < 1e-9,
    shaderRain: stepped.shaderRain,
  }
}
