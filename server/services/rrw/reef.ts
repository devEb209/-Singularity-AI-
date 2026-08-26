import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import { moveMoles, sumMoles } from './pool.js'

export const stepReef = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = sumMoles(nodes, 'CaCO3')
  const built = moveMoles(nodes, 'outcrop', 'ocean', 'CaCO3', 0.3)
  const ocean = built.nodes.find(item => item.id === 'ocean')
  return {
    nodes: built.nodes,
    before,
    after: sumMoles(built.nodes, 'CaCO3'),
    conserved: Math.abs(sumMoles(built.nodes, 'CaCO3') - before) < 1e-9,
    built: built.take > 0 && Boolean(ocean && molesOf(ocean, 'CaCO3') > 0),
    meshCoral: false as const,
  }
}

export const compareReef = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepReef(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, built: stepped.built, meshCoral: stepped.meshCoral }
}
