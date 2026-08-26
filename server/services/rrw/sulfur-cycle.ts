import { composeWithStructures } from './structure.js'
import { moveMoles, seedIfMissing, sumMoles } from './pool.js'

export const stepSulfur = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const seeded = seedIfMissing(nodes, 'soil', 'S', 0.35)
  const before = sumMoles(seeded.nodes, 'S')
  const toAir = moveMoles(seeded.nodes, 'soil', 'atmosphere', 'S', 0.02)
  const rain = moveMoles(toAir.nodes, 'atmosphere', 'ocean', 'S', 0.015)
  const after = sumMoles(rain.nodes, 'S')
  return {
    nodes: rain.nodes,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    moved: toAir.take + rain.take > 0,
    nistAssay: false as const,
  }
}

export const compareSulfur = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const stepped = stepSulfur(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, moved: stepped.moved, nistAssay: stepped.nistAssay }
}
