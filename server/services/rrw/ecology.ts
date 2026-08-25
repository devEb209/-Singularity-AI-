import { applyReaction, reactions } from './chemistry.js'
import { stepOrganisms } from './organism.js'
import type { RealityNode, RealityRelation } from './types.js'

export const foodWeb = (nodes: RealityNode[]): RealityRelation[] => {
  const tree = nodes.find(item => item.living?.species === 'tree')
  const animal = nodes.find(item => item.living?.species === 'animal')
  const human = nodes.find(item => item.living?.species === 'human')
  const edges: RealityRelation[] = []
  if (tree && animal) edges.push({ from: tree.id, to: animal.id, kind: 'feeds' })
  if (tree && human) edges.push({ from: tree.id, to: human.id, kind: 'feeds' })
  if (animal && human) edges.push({ from: animal.id, to: human.id, kind: 'feeds' })
  return edges
}

export const stepEcology = (nodes: RealityNode[], dt = 1) => {
  const photos = applyReaction(nodes, reactions[3], dt, 'tree')
  const living = stepOrganisms(photos.nodes)
  return {
    nodes: living,
    web: foodWeb(living),
    photosynthesis: photos.progressed,
    consciousnessClaim: false as const,
    uniqueFullMinds: false as const,
  }
}
