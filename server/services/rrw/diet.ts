import { composeWithStructures } from './structure.js'
import { atomC, convertMoles } from './pool.js'

export const stepDiet = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = atomC(nodes)
  const eaten = convertMoles(nodes, 'human', 'C6H12O6', 1, 'atmosphere', 'CO2', 6, 0.05)
  const after = atomC(eaten.nodes)
  return {
    nodes: eaten.nodes,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    respired: eaten.take > 0,
    nutritionApp: false as const,
  }
}

export const compareDiet = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepDiet(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, respired: stepped.respired, nutritionApp: stepped.nutritionApp }
}
