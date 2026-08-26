import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import { moveMoles } from './pool.js'

export const stepRootUptake = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = waterMoles(nodes)
  const taken = moveMoles(nodes, 'soil', 'tree', 'H2O', 0.3)
  return {
    nodes: taken.nodes,
    before,
    after: waterMoles(taken.nodes),
    conserved: Math.abs(waterMoles(taken.nodes) - before) < 1e-9,
    taken: taken.take > 0,
    shaderRoot: false as const,
  }
}

export const compareRootUptake = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepRootUptake(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, taken: stepped.taken, shaderRoot: stepped.shaderRoot }
}
