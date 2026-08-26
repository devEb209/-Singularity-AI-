import { composeWithStructures } from './structure.js'
import { sumMoles, moveMoles } from './pool.js'

export const stepConstruction = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const shelter = nodes.find(item => item.id === 'shelter')
  const before = sumMoles(nodes, 'SiO2')
  const built = shelter ? moveMoles(nodes, 'outcrop', 'shelter', 'SiO2', 0.5) : { nodes, take: 0 }
  return {
    nodes: built.nodes,
    before,
    after: sumMoles(built.nodes, 'SiO2'),
    conserved: Math.abs(sumMoles(built.nodes, 'SiO2') - before) < 1e-9,
    built: built.take > 0,
    meshPrefab: false as const,
  }
}

export const compareConstruction = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepConstruction(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, built: stepped.built, meshPrefab: stepped.meshPrefab }
}
