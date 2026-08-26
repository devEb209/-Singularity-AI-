import { composeWithStructures } from './structure.js'
import { centerOf, distanceBetween } from './extent.js'
import type { RealityNode } from './types.js'

export const territoryOf = (node: RealityNode) => {
  const c = centerOf(node)
  const radius = node.living?.species === 'human' ? 2.4 : 1.6
  return { center: c, radius }
}

export const stepTerritory = (nodes: RealityNode[]) => {
  const human = nodes.find(item => item.id === 'human')
  const animal = nodes.find(item => item.id === 'animal')
  if (!human || !animal) return { nodes, overlap: false as const, recast: false as const }
  const a = territoryOf(human)
  const b = territoryOf(animal)
  const overlap = distanceBetween(human, animal) < a.radius + b.radius
  const claim = {
    id: 'territory-overlap',
    statement: `territory overlap=${overlap}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'territory',
  }
  return {
    nodes: nodes.map(node => (node.id === 'human' ? { ...node, claims: [...node.claims, claim] } : node)),
    overlap,
    recast: false as const,
  }
}

export const compareTerritory = (prompt = 'oceano salgado com um humano') => {
  const stepped = stepTerritory(composeWithStructures(prompt).nodes)
  return { overlap: stepped.overlap, recast: stepped.recast }
}
