import { composeWithStructures } from './structure.js'
import { atomC, convertMoles } from './pool.js'

export const stepCarbon = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = atomC(nodes)
  const litter = convertMoles(nodes, 'tree', 'C6H10O5', 1, 'soil', 'C6H10O5', 1, 0.08)
  const decay = convertMoles(litter.nodes, 'soil', 'C6H10O5', 1, 'atmosphere', 'CO2', 6, 0.03)
  const fix = convertMoles(decay.nodes, 'atmosphere', 'CO2', 6, 'tree', 'C6H10O5', 1, 0.02)
  const after = atomC(fix.nodes)
  return {
    nodes: fix.nodes,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    moved: litter.take + decay.take + fix.take > 0,
    closedWorld: false as const,
  }
}

export const compareCarbon = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepCarbon(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, moved: stepped.moved, closedWorld: stepped.closedWorld }
}
