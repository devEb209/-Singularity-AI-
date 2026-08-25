import { climateAt } from './climate.js'
import { airFrom, fractionOf } from './atmosphere.js'
import { centerOf, distanceBetween, molesOf } from './extent.js'
import type { OrganismState, RealityNode } from './types.js'

const systemsFor = (species: string) => {
  if (species === 'tree') return ['photosynthetic', 'vascular', 'structural'].map(id => ({ id, integrity: 1 }))
  if (species === 'animal') return ['metabolic', 'respiratory', 'sensory', 'motor'].map(id => ({ id, integrity: 1 }))
  return ['metabolic', 'respiratory', 'circulatory', 'sensory', 'motor'].map(id => ({ id, integrity: 1 }))
}

export const perceive = (self: RealityNode, nodes: RealityNode[]) => {
  const seen = nodes
    .filter(item => item.id !== self.id && distanceBetween(self, item) < 12)
    .sort((a, b) => distanceBetween(self, a) - distanceBetween(self, b))
    .slice(0, 6)
    .map(item => item.id)
  const heard = nodes.filter(item => item.emissionScale > 0.2 || item.id === 'fire').map(item => item.id)
  return { seen, heard }
}

export const needsOf = (node: RealityNode, nodes: RealityNode[]): OrganismState['needs'] => {
  const air = nodes.find(item => item.id === 'atmosphere')
  const oxygen = fractionOf(airFrom(air), 'O2')
  const climate = climateAt(nodes, centerOf(node))
  const water = molesOf(node, 'H2O') + (nodes.some(item => item.id === 'ocean' && distanceBetween(node, item) < 8) ? 2 : 0)
  const fuel = molesOf(node, 'C6H12O6') + molesOf(node, 'C6H10O5')
  const feltK = node.kind === 'living' ? node.temperatureK : climate.temperatureK
  const band = node.living?.species === 'tree' ? feltK > 250 && feltK < 330 : feltK > 280 && feltK < 316
  return {
    energy: Math.max(0, Math.min(1, fuel / 2)),
    water: Math.max(0, Math.min(1, water / 8)),
    oxygen: Math.max(0, Math.min(1, oxygen / 0.21)),
    temperatureOk: band,
  }
}

export const decideAction = (species: string, needs: OrganismState['needs'], nodes: RealityNode[], self: RealityNode) => {
  if (!needs.temperatureOk) return 'seek-shelter'
  if (needs.oxygen < 0.6) return 'seek-air'
  if (needs.water < 0.35) return 'seek-water'
  if (species === 'tree') return 'photosynthesize'
  if (needs.energy < 0.4) return 'forage'
  const tool = nodes.find(item => item.id === 'tool')
  if (species === 'human' && tool && distanceBetween(self, tool) < 1.2) return 'grasp'
  return 'observe'
}

export const bindOrganism = (node: RealityNode, nodes: RealityNode[]): RealityNode => {
  if (node.kind !== 'living' && !node.living) return node
  const species = node.living?.species ?? node.organism?.species ?? 'human'
  const needs = needsOf(node, nodes)
  const perception = perceive(node, nodes)
  const organism: OrganismState = {
    species,
    identity: node.living?.identity ?? node.id,
    systems: systemsFor(species),
    needs,
    perception,
    action: decideAction(species, needs, nodes, node),
    consciousnessClaim: false,
  }
  return {
    ...node,
    living: { species, identity: organism.identity, consciousnessClaim: false },
    organism,
  }
}

export const stepOrganisms = (nodes: RealityNode[]) => nodes.map(node => bindOrganism(node, nodes))
