import { composeWithStructures } from './structure.js'
import { sumMoles, moveMoles } from './pool.js'

export const stepSediment = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = sumMoles(nodes, 'SiO2')
  const toRiver = moveMoles(nodes, 'soil', 'river', 'SiO2', 0.15)
  const toOcean = moveMoles(toRiver.nodes, 'river', 'ocean', 'SiO2', 0.1)
  return {
    nodes: toOcean.nodes,
    before,
    after: sumMoles(toOcean.nodes, 'SiO2'),
    conserved: Math.abs(sumMoles(toOcean.nodes, 'SiO2') - before) < 1e-9,
    deposited: toOcean.take > 0,
    heightmapIsIdentity: false as const,
  }
}

export const compareSediment = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepSediment(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, deposited: stepped.deposited, heightmapIsIdentity: stepped.heightmapIsIdentity }
}
