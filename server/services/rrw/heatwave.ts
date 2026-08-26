import { composeWithStructures } from './structure.js'
import { canopyShadeK } from './canopy.js'
import { climateAt } from './climate.js'
import { centerOf } from './extent.js'
import type { RealityNode } from './types.js'

export const stepHeatwave = (nodes: RealityNode[], lift = 12) => {
  const next = nodes.map(node => {
    if (node.id === 'atmosphere' || node.id === 'soil' || node.id === 'human') {
      return { ...node, temperatureK: node.temperatureK + lift }
    }
    return node
  })
  const human = next.find(item => item.id === 'human')
  const outside = human ? climateAt(next, centerOf(human)).temperatureK : 0
  const felt = human ? canopyShadeK(human, next) : 0
  const air = next.find(item => item.id === 'atmosphere')?.temperatureK ?? 0
  return {
    nodes: next,
    hotter: air > (nodes.find(item => item.id === 'atmosphere')?.temperatureK ?? 0),
    canopyHelps: Boolean(human && felt < outside),
    shaderHeat: false as const,
  }
}

export const compareHeatwave = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepHeatwave(composeWithStructures(prompt).nodes)
  return { hotter: stepped.hotter, canopyHelps: stepped.canopyHelps, shaderHeat: stepped.shaderHeat }
}
