import { composeWithStructures } from './structure.js'
import { sumMoles, moveMoles } from './pool.js'

export const stepAgriculture = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const human = nodes.find(item => item.id === 'human')
  const before = sumMoles(nodes, 'C6H10O5')
  const tended = human ? moveMoles(nodes, 'soil', 'tree', 'C6H10O5', 0.06) : { nodes, take: 0 }
  return {
    nodes: tended.nodes,
    before,
    after: sumMoles(tended.nodes, 'C6H10O5'),
    conserved: Math.abs(sumMoles(tended.nodes, 'C6H10O5') - before) < 1e-9,
    tended: tended.take > 0,
    tycoon: false as const,
  }
}

export const compareAgriculture = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepAgriculture(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, tended: stepped.tended, tycoon: stepped.tycoon }
}
