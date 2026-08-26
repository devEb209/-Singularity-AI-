import { composeWithStructures } from './structure.js'
import { distanceBetween } from './extent.js'
import { moveMoles, sumMoles } from './pool.js'
import type { RealityRelation } from './types.js'

export const stepPollination = (nodes: ReturnType<typeof composeWithStructures>['nodes'], relations: RealityRelation[] = []) => {
  const tree = nodes.find(item => item.id === 'tree')
  const animal = nodes.find(item => item.id === 'animal')
  const near = Boolean(tree && animal && distanceBetween(tree, animal) < 20)
  const before = sumMoles(nodes, 'C6H10O5')
  const moved = near ? moveMoles(nodes, 'tree', 'animal', 'C6H10O5', 0.02) : { nodes, take: 0 }
  const nextRelations = near && !relations.some(item => item.from === 'animal' && item.to === 'tree' && item.kind === 'exchanges')
    ? [...relations, { from: 'animal', to: 'tree', kind: 'exchanges' as const }]
    : relations
  return {
    nodes: moved.nodes,
    relations: nextRelations,
    before,
    after: sumMoles(moved.nodes, 'C6H10O5'),
    conserved: Math.abs(sumMoles(moved.nodes, 'C6H10O5') - before) < 1e-9,
    pollinated: moved.take > 0,
    particlePollen: false as const,
  }
}

export const comparePollination = (prompt = 'floresta com um humano') => {
  const composed = composeWithStructures(prompt)
  const stepped = stepPollination(composed.nodes, composed.relations)
  return { conserved: stepped.conserved, pollinated: stepped.pollinated, particlePollen: stepped.particlePollen }
}
