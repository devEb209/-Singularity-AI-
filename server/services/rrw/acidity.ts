import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import { convertMoles, sumMoles } from './pool.js'

export const acidityOf = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const ocean = nodes.find(item => item.id === 'ocean')
  const water = ocean ? molesOf(ocean, 'H2O') : 1
  return (ocean ? molesOf(ocean, 'CO2') : 0) / Math.max(1, water)
}

export const stepAcidity = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = sumMoles(nodes, 'CO2')
  const beforeAcid = acidityOf(nodes)
  const dissolved = convertMoles(nodes, 'atmosphere', 'CO2', 1, 'ocean', 'CO2', 1, 0.03)
  const afterAcid = acidityOf(dissolved.nodes)
  return {
    nodes: dissolved.nodes,
    before,
    after: sumMoles(dissolved.nodes, 'CO2'),
    conserved: Math.abs(sumMoles(dissolved.nodes, 'CO2') - before) < 1e-9,
    moreAcid: afterAcid > beforeAcid,
    phMeter: false as const,
  }
}

export const compareAcidity = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const stepped = stepAcidity(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, moreAcid: stepped.moreAcid, phMeter: stepped.phMeter }
}
