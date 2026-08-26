import { createHash } from 'node:crypto'
import { budgetOf } from './quantities.js'
import { freezeReality, thawNodes, thawReality } from './snapshot.js'
import type { RealityNode, RealityRelation } from './types.js'

export const persistRealityGraph = (nodes: RealityNode[], relations: RealityRelation[]) => {
  const frozen = freezeReality(nodes, relations)
  const quantities = budgetOf(nodes)
  const payload = JSON.stringify({
    format: 'rrw-reality-graph-v1',
    frozen,
    quantities,
    claims: nodes.flatMap(item => item.claims),
    inventories: nodes.map(item => ({ id: item.id, inventory: item.inventory ?? [] })),
    meshStore: false,
    assetStore: false,
  })
  return {
    bytes: payload.length,
    checksum: createHash('sha256').update(payload).digest('hex'),
    payload,
    quantities,
    meshStore: false as const,
    assetStore: false as const,
  }
}

export const restoreRealityGraph = (payload: string) => {
  const parsed = JSON.parse(payload) as { frozen: { payload: string }; quantities: { mass: number } }
  const thawed = thawReality(parsed.frozen)
  return {
    nodes: thawed.nodes.length,
    relations: thawed.relations.length,
    mass: parsed.quantities.mass,
  }
}

export const loadRealityGraph = (payload: string) => {
  const parsed = JSON.parse(payload) as { frozen: { payload: string }; quantities: { mass: number } }
  const thawed = thawReality(parsed.frozen)
  return {
    nodes: thawNodes(parsed.frozen),
    relations: thawed.relations,
    mass: parsed.quantities.mass,
    meshStore: false as const,
  }
}
