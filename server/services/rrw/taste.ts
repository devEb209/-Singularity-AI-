import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import type { RealityNode } from './types.js'

export const tasteOf = (node: RealityNode) => {
  const salt = molesOf(node, 'NaCl')
  const sweet = molesOf(node, 'C6H12O6')
  const water = molesOf(node, 'H2O')
  if (salt > 0.2) return 'salty'
  if (sweet > 0.3) return 'sweet'
  if (water > 1) return 'water'
  return 'bland'
}

export const stepTaste = (nodes: RealityNode[], eaterId = 'human') => {
  const eater = nodes.find(item => item.id === eaterId)
  if (!eater) return { nodes, taste: 'bland' as const, tasted: false as const, nutritionApp: false as const }
  const taste = tasteOf(eater)
  const claim = {
    id: `taste-${eaterId}`,
    statement: `taste: ${taste}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'taste',
  }
  return {
    nodes: nodes.map(node => (node.id === eaterId ? { ...node, claims: [...node.claims, claim] } : node)),
    taste,
    tasted: taste !== 'bland',
    nutritionApp: false as const,
  }
}

export const compareTaste = () => {
  const human = stepTaste(composeWithStructures('oceano salgado com um humano e um abrigo').nodes, 'human')
  const ocean = tasteOf(composeWithStructures('oceano salgado com um humano').nodes.find(item => item.id === 'ocean')!)
  return { humanTasted: human.tasted, oceanSalty: ocean === 'salty', nutritionApp: human.nutritionApp }
}
