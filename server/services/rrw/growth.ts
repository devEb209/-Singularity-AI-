import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import { moveMoles, sumMoles } from './pool.js'
import { stepReproduction } from './reproduction.js'

export const stepGrowth = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const target = nodes.some(item => item.id === 'sapling') ? 'sapling' : 'tree'
  const before = sumMoles(nodes, 'C6H10O5')
  const grown = moveMoles(nodes, 'soil', target, 'C6H10O5', 0.05)
  const sapling = grown.nodes.find(item => item.id === 'sapling')
  return {
    nodes: grown.nodes,
    before,
    after: sumMoles(grown.nodes, 'C6H10O5'),
    conserved: Math.abs(sumMoles(grown.nodes, 'C6H10O5') - before) < 1e-9,
    grew: grown.take > 0,
    saplingMoles: sapling ? molesOf(sapling, 'C6H10O5') : 0,
    instantAaa: false as const,
  }
}

export const compareGrowth = (prompt = 'floresta com um humano e um abrigo') => {
  const composed = composeWithStructures(prompt)
  const reproduced = stepReproduction(composed.nodes, composed.relations)
  const grown = stepGrowth(reproduced.nodes)
  return { conserved: grown.conserved, grew: grown.grew, spawned: reproduced.spawned }
}
