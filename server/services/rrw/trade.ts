import { molesOf, setMoles } from './extent.js'
import { composeWithStructures } from './structure.js'
import type { RealityNode, RealityRelation } from './types.js'

export const glucosePool = (nodes: RealityNode[]) =>
  nodes.reduce((sum, node) => sum + molesOf(node, 'C6H12O6'), 0)

const withGlucose = (node: RealityNode, moles: number): RealityNode =>
  ({ ...node, inventory: setMoles(node.inventory ?? [], 'C6H12O6', Math.max(0, moles)) })

export const stepTrade = (nodes: RealityNode[], relations: RealityRelation[] = []) => {
  const before = glucosePool(nodes)
  const human = nodes.find(item => item.id === 'human')
  const animal = nodes.find(item => item.id === 'animal')
  const give = human && animal ? Math.min(0.1, molesOf(human, 'C6H12O6') * 0.2) : 0
  const next = nodes.map(node => {
    if (node.id === 'human') return withGlucose(node, molesOf(node, 'C6H12O6') - give)
    if (node.id === 'animal') return withGlucose(node, molesOf(node, 'C6H12O6') + give)
    return node
  })
  const traded = give > 0
  const nextRelations = traded && !relations.some(item => item.from === 'human' && item.to === 'animal' && item.kind === 'exchanges')
    ? [...relations, { from: 'human', to: 'animal', kind: 'exchanges' as const }]
    : relations
  return {
    nodes: next,
    relations: nextRelations,
    before,
    after: glucosePool(next),
    give,
    conserved: Math.abs(glucosePool(next) - before) < 1e-9,
    traded,
    marketplace: false as const,
    consciousnessClaim: false as const,
  }
}

export const compareTrade = (prompt = 'oceano salgado com um humano') => {
  const stepped = stepTrade(composeWithStructures(prompt).nodes)
  return {
    conserved: stepped.conserved,
    traded: stepped.traded,
    marketplace: stepped.marketplace,
  }
}
