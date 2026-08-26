import { climateAt } from './climate.js'
import { composeWithStructures } from './structure.js'
import { applyTimeClimate, climateBaseOf } from './season.js'
import { centerOf, distanceBetween } from './extent.js'
import type { RealityNode } from './types.js'

export const insideShelter = (node: RealityNode, nodes: RealityNode[]) => {
  const shelter = nodes.find(item => item.id === 'shelter')
  if (!shelter) return false
  return distanceBetween(node, shelter) < 2.2
}

export const feltTemperature = (node: RealityNode, nodes: RealityNode[]) => {
  const outside = climateAt(nodes, centerOf(node)).temperatureK
  if (node.kind !== 'living' || !insideShelter(node, nodes)) return outside
  const shelter = nodes.find(item => item.id === 'shelter')!
  return outside * 0.35 + shelter.temperatureK * 0.65
}

export const compareShelterClimate = (prompt = 'neve alpina no cume com um humano e um abrigo') => {
  const composed = composeWithStructures(prompt)
  const winter = applyTimeClimate(composed.nodes, climateBaseOf(composed.nodes), { hour: 2, dayOfYear: 15, moon: 0 })
  const human = winter.find(item => item.id === 'human')!
  const felt = feltTemperature(human, winter)
  const outside = climateAt(winter, centerOf(human)).temperatureK
  return {
    inside: insideShelter(human, winter),
    felt,
    outside,
    shelterWarmer: felt > outside,
    skybox: false as const,
    shaderIndoor: false as const,
  }
}
