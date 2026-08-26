import { composeWithStructures } from './structure.js'
import { climateAt } from './climate.js'
import { centerOf, distanceBetween } from './extent.js'
import type { RealityNode } from './types.js'

export const canopyShadeK = (node: RealityNode, nodes: RealityNode[]) => {
  const tree = nodes.find(item => item.id === 'tree')
  const air = climateAt(nodes, centerOf(node)).temperatureK
  if (!tree || distanceBetween(node, tree) > 8) return air
  return air - 2.4
}

export const stepCanopy = (nodes: RealityNode[]) => {
  const human = nodes.find(item => item.id === 'human')
  if (!human) return { nodes, shaded: false as const, shaderLeaf: false as const }
  const outside = climateAt(nodes, centerOf(human)).temperatureK
  const felt = canopyShadeK(human, nodes)
  return { nodes, shaded: felt < outside, drop: outside - felt, shaderLeaf: false as const }
}

export const compareCanopy = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepCanopy(composeWithStructures(prompt).nodes)
  return { shaded: stepped.shaded, shaderLeaf: stepped.shaderLeaf }
}
