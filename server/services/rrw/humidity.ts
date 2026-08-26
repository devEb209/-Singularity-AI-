import { composeReality } from './compose.js'
import { molesOf } from './extent.js'
import type { RealityNode } from './types.js'

export const humidityOf = (nodes: RealityNode[]) => {
  const air = nodes.find(item => item.id === 'atmosphere')
  if (!air) return 0
  const vapor = molesOf(air, 'H2O')
  const dry = (air.inventory ?? []).reduce((sum, item) => sum + item.moles, 0) || 1
  return vapor / dry
}

export const compareHumidity = () => {
  const forest = humidityOf(composeReality('floresta com um humano').nodes)
  const desert = humidityOf(composeReality('deserto quente e árido').nodes)
  return { forestWetter: forest > desert, forest, desert, shaderFog: false as const }
}
