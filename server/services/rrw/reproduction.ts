import { molesOf } from './extent.js'
import { composeWithStructures } from './structure.js'
import type { RealityNode, RealityRelation } from './types.js'

export const stepReproduction = (nodes: RealityNode[], relations: RealityRelation[] = []) => {
  const tree = nodes.find(item => item.id === 'tree')
  const exists = nodes.some(item => item.id === 'sapling')
  const can = Boolean(tree && molesOf(tree, 'C6H10O5') > 4 && !exists)
  if (!can || !tree) {
    return { nodes, relations, spawned: false as const, consciousnessClaim: false as const, uniqueFullMinds: false as const }
  }
  const sapling: RealityNode = {
    id: 'sapling',
    kind: 'living',
    label: 'cellulose sapling',
    substanceId: 'C6H10O5',
    temperatureK: tree.temperatureK,
    pressurePa: tree.pressurePa,
    phase: tree.phase,
    extent: { kind: 'sphere', center: [-1.2, 0.4, 1.4], radius: 0.35 },
    living: { species: 'tree', identity: `${tree.living?.identity ?? 'grove'}-offshoot`, consciousnessClaim: false },
    emissionScale: 0,
    claims: [],
    inventory: [{ substanceId: 'C6H10O5', moles: 0.4 }, { substanceId: 'H2O', moles: 0.8 }],
    domain: 'life',
  }
  return {
    nodes: [...nodes, sapling],
    relations: [...relations, { from: 'tree', to: 'sapling', kind: 'kin' as const }],
    spawned: true as const,
    consciousnessClaim: false as const,
    uniqueFullMinds: false as const,
  }
}

export const compareReproduction = (prompt = 'floresta com um humano e um abrigo') => {
  const composed = composeWithStructures(prompt)
  const first = stepReproduction(composed.nodes, composed.relations)
  const second = stepReproduction(first.nodes, first.relations)
  return {
    spawned: first.spawned,
    once: first.spawned && !second.spawned,
    consciousnessClaim: first.consciousnessClaim,
  }
}
