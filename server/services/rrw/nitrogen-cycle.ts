import { composeWithStructures } from './structure.js'
import { atomN, convertMoles } from './pool.js'

export const stepNitrogen = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = atomN(nodes)
  const fix = convertMoles(nodes, 'atmosphere', 'N2', 1, 'soil', 'NH3', 2, 0.04)
  const uptake = convertMoles(fix.nodes, 'soil', 'NH3', 1, 'tree', 'NH3', 1, 0.05)
  const denitrify = convertMoles(uptake.nodes, 'tree', 'NH3', 2, 'atmosphere', 'N2', 1, 0.01)
  const after = atomN(denitrify.nodes)
  return {
    nodes: denitrify.nodes,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    fixed: fix.take > 0,
    nistAssay: false as const,
  }
}

export const compareNitrogen = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepNitrogen(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, fixed: stepped.fixed, nistAssay: stepped.nistAssay }
}
