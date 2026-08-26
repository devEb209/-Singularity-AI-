import { composeWithStructures } from './structure.js'
import { atomC, moveMoles } from './pool.js'

export const stepGift = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = atomC(nodes)
  const given = moveMoles(nodes, 'human', 'animal', 'C6H12O6', 0.08)
  return {
    nodes: given.nodes,
    before,
    after: atomC(given.nodes),
    conserved: Math.abs(atomC(given.nodes) - before) < 1e-9,
    given: given.take > 0,
    marketplace: false as const,
  }
}

export const compareGift = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepGift(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, given: stepped.given, marketplace: stepped.marketplace }
}
