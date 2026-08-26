import { composeWithStructures } from './structure.js'
import { moveMoles, seedIfMissing, sumMoles } from './pool.js'

export const stepPhosphorus = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const seeded = seedIfMissing(nodes, 'soil', 'P', 0.6)
  const before = sumMoles(seeded.nodes, 'P')
  const uptake = moveMoles(seeded.nodes, 'soil', 'tree', 'P', 0.04)
  const litter = moveMoles(uptake.nodes, 'tree', 'soil', 'P', 0.015)
  const after = sumMoles(litter.nodes, 'P')
  return {
    nodes: litter.nodes,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    moved: uptake.take + litter.take > 0,
    crustalAssay: false as const,
  }
}

export const comparePhosphorus = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepPhosphorus(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, moved: stepped.moved, crustalAssay: stepped.crustalAssay }
}
