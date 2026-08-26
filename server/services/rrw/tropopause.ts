import { composeWithStructures } from './structure.js'
import type { RealityNode } from './types.js'

export const layerTemps = (nodes: RealityNode[]) => {
  const air = nodes.find(item => item.id === 'atmosphere')
  const cloud = nodes.find(item => item.id === 'cloud')
  const storm = nodes.find(item => item.id === 'storm')
  return {
    troposphere: air?.temperatureK ?? 0,
    tropopause: cloud?.temperatureK ?? 0,
    stratosphere: storm?.temperatureK ?? 0,
    inversion: (storm?.temperatureK ?? 0) <= (air?.temperatureK ?? 0),
    skybox: false as const,
  }
}

export const compareTropopause = (prompt = 'oceano salgado sob céu nublado') => {
  const layers = layerTemps(composeWithStructures(prompt).nodes)
  return { inversion: layers.inversion, skybox: layers.skybox, hasCloud: layers.tropopause > 0 }
}
