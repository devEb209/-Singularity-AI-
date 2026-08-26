import { composeWithStructures } from './structure.js'
import { sumMoles, moveMoles } from './pool.js'

export const stepToolCraft = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = sumMoles(nodes, 'Fe2O3')
  const crafted = moveMoles(nodes, 'soil', 'tool', 'Fe2O3', 0.2)
  return {
    nodes: crafted.nodes,
    before,
    after: sumMoles(crafted.nodes, 'Fe2O3'),
    conserved: Math.abs(sumMoles(crafted.nodes, 'Fe2O3') - before) < 1e-9,
    crafted: crafted.take > 0,
    smithingMinigame: false as const,
  }
}

export const compareToolCraft = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepToolCraft(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, crafted: stepped.crafted, smithingMinigame: stepped.smithingMinigame }
}
