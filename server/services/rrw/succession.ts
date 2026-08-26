import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import { atomC, convertMoles } from './pool.js'

export const stepSuccession = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = atomC(nodes)
  const pioneer = convertMoles(nodes, 'atmosphere', 'CO2', 6, 'soil', 'C6H10O5', 1, 0.015)
  const afterOrganics = molesOf(pioneer.nodes.find(item => item.id === 'soil')!, 'C6H10O5')
  return {
    nodes: pioneer.nodes,
    before,
    after: atomC(pioneer.nodes),
    conserved: Math.abs(atomC(pioneer.nodes) - before) < 1e-9,
    richerSoil: afterOrganics > molesOf(nodes.find(item => item.id === 'soil')!, 'C6H10O5'),
    textureBiome: false as const,
  }
}

export const compareSuccession = (prompt = 'floresta com fogo e um humano') => {
  const stepped = stepSuccession(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, richerSoil: stepped.richerSoil, textureBiome: stepped.textureBiome }
}
