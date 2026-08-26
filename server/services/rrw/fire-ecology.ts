import { composeWithStructures } from './structure.js'
import { atomC, convertMoles } from './pool.js'

export const stepFireEcology = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = atomC(nodes)
  const burned = convertMoles(nodes, 'tree', 'C6H10O5', 1, 'atmosphere', 'CO2', 6, 0.04)
  return {
    nodes: burned.nodes,
    before,
    after: atomC(burned.nodes),
    conserved: Math.abs(atomC(burned.nodes) - before) < 1e-9,
    burned: burned.take > 0,
    particleFire: false as const,
  }
}

export const compareFireEcology = (prompt = 'floresta com fogo e um humano') => {
  const stepped = stepFireEcology(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, burned: stepped.burned, particleFire: stepped.particleFire }
}
