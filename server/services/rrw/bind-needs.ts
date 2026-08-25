import { airFrom, fractionOf } from './atmosphere.js'
import { climateAt } from './climate.js'
import { centerOf, distanceBetween, molesOf } from './extent.js'
import { feltTemperature } from './shelter-climate.js'
import type { OrganismNeed, RealityNode } from './types.js'

export const needsFromReality = (node: RealityNode, nodes: RealityNode[]): OrganismNeed => {
  const air = nodes.find(item => item.id === 'atmosphere')
  const oxygen = fractionOf(airFrom(air), 'O2')
  const nearbyOcean = nodes.some(item => item.id === 'ocean' && distanceBetween(node, item) < 8)
  const water = molesOf(node, 'H2O') + (nearbyOcean ? 2 : 0)
  const fuel = molesOf(node, 'C6H12O6') + molesOf(node, 'C6H10O5')
  const living = Boolean(node.kind === 'living' || node.living)
  const feltK = living ? feltTemperature(node, nodes) : climateAt(nodes, centerOf(node)).temperatureK
  const sheltered = living && nodes.some(item => item.id === 'shelter') && feltTemperature(node, nodes) > climateAt(nodes, centerOf(node)).temperatureK
  const band = node.living?.species === 'tree'
    ? feltK > 250 && feltK < 330
    : sheltered ? feltK > 270 && feltK < 320 : feltK > 280 && feltK < 316
  return {
    energy: Math.max(0, Math.min(1, fuel / 2)),
    water: Math.max(0, Math.min(1, water / 8)),
    oxygen: Math.max(0, Math.min(1, oxygen / 0.21)),
    temperatureOk: band,
  }
}

export const decideFromReality = (node: RealityNode, nodes: RealityNode[]) => {
  const needs = needsFromReality(node, nodes)
  const species = node.living?.species ?? 'human'
  if (!needs.temperatureOk) return { needs, action: 'seek-shelter' as const }
  if (needs.oxygen < 0.6) return { needs, action: 'seek-air' as const }
  if (needs.water < 0.35) return { needs, action: 'seek-water' as const }
  if (species === 'tree') return { needs, action: 'photosynthesize' as const }
  if (needs.energy < 0.4) return { needs, action: 'forage' as const }
  return { needs, action: 'observe' as const }
}
