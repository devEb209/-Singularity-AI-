import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import { moveMoles, sumMoles } from './pool.js'

export const stepConflictShare = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = sumMoles(nodes, 'C6H10O5')
  const tree = nodes.find(item => item.id === 'tree')
  const pool = tree ? molesOf(tree, 'C6H10O5') * 0.06 : 0
  const toHuman = moveMoles(nodes, 'tree', 'human', 'C6H10O5', pool / 2)
  const toAnimal = moveMoles(toHuman.nodes, 'tree', 'animal', 'C6H10O5', pool / 2)
  return {
    nodes: toAnimal.nodes,
    before,
    after: sumMoles(toAnimal.nodes, 'C6H10O5'),
    conserved: Math.abs(sumMoles(toAnimal.nodes, 'C6H10O5') - before) < 1e-9,
    shared: toHuman.take > 0 && toAnimal.take > 0,
    questLog: false as const,
  }
}

export const compareConflictShare = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepConflictShare(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, shared: stepped.shared, questLog: stepped.questLog }
}
