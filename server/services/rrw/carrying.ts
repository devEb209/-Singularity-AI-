import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import type { RealityNode } from './types.js'

export const carryingOf = (nodes: RealityNode[]) => {
  const fuel = nodes.reduce((sum, node) => sum + molesOf(node, 'C6H10O5') + molesOf(node, 'C6H12O6'), 0)
  const living = nodes.filter(item => item.kind === 'living' || item.living).length
  const support = Math.max(1, Math.floor(fuel / 0.8))
  return {
    living,
    support,
    overflow: Math.max(0, living - support),
    noFixedCap: true as const,
    uniqueFullMinds: false as const,
  }
}

export const compareCarrying = () => {
  const forest = carryingOf(composeWithStructures('floresta com um humano e um abrigo').nodes)
  const desert = carryingOf(composeWithStructures('deserto quente e árido com um humano').nodes)
  return {
    forestSupportsMore: forest.support >= desert.support,
    noFixedCap: forest.noFixedCap && desert.noFixedCap,
    uniqueFullMinds: false as const,
  }
}
