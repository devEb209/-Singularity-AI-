import { composeWithStructures } from './structure.js'
import { contact } from './mechanics.js'
import { distanceBetween } from './extent.js'
import type { RealityNode } from './types.js'

export const stepTouch = (nodes: RealityNode[]) => {
  const human = nodes.find(item => item.id === 'human')
  const tool = nodes.find(item => item.id === 'tool')
  const fire = nodes.find(item => item.id === 'fire')
  if (!human || !tool) return { nodes, grasped: false as const, burned: false as const, rigidbodyAsset: false as const }
  const grasped = contact(human, tool).hit || distanceBetween(human, tool) < 1.2
  const burned = Boolean(fire && distanceBetween(human, fire) < 1.6)
  const claim = {
    id: 'touch-human',
    statement: `touch: tool=${grasped} heat=${burned}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'touch',
  }
  return {
    nodes: nodes.map(node => (node.id === 'human' ? { ...node, claims: [...node.claims, claim] } : node)),
    grasped,
    burned,
    rigidbodyAsset: false as const,
  }
}

export const compareTouch = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const stepped = stepTouch(composeWithStructures(prompt).nodes)
  return { grasped: stepped.grasped, burned: stepped.burned, rigidbodyAsset: stepped.rigidbodyAsset }
}
