import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import { moveMoles, sumMoles } from './pool.js'

export const salinityOf = (nodeId: string, nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const node = nodes.find(item => item.id === nodeId)
  if (!node) return 0
  const water = molesOf(node, 'H2O')
  return water > 0 ? molesOf(node, 'NaCl') / water : 0
}

export const stepSalinity = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = sumMoles(nodes, 'NaCl')
  const mixed = moveMoles(nodes, 'ocean', 'river', 'NaCl', 0.08)
  return {
    nodes: mixed.nodes,
    before,
    after: sumMoles(mixed.nodes, 'NaCl'),
    conserved: Math.abs(sumMoles(mixed.nodes, 'NaCl') - before) < 1e-9,
    oceanSaltier: salinityOf('ocean', mixed.nodes) > salinityOf('river', mixed.nodes),
    mixed: mixed.take > 0,
    shaderSalt: false as const,
  }
}

export const compareSalinity = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepSalinity(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, oceanSaltier: stepped.oceanSaltier, shaderSalt: stepped.shaderSalt }
}
