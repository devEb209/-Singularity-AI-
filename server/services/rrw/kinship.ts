import { composeWithStructures } from './structure.js'
import { distanceBetween } from './extent.js'
import type { RealityNode, RealityRelation } from './types.js'

export const bindKinship = (nodes: RealityNode[], relations: RealityRelation[] = []) => {
  const living = nodes.filter(item => item.kind === 'living' || item.living)
  const next = [...relations]
  const human = living.find(item => item.id === 'human')
  const animal = living.find(item => item.id === 'animal')
  if (human && animal && distanceBetween(human, animal) < 20 && !next.some(item => item.kind === 'kin' && item.from === human.id && item.to === animal.id)) {
    next.push({ from: human.id, to: animal.id, kind: 'kin' })
  }
  const tree = living.find(item => item.id === 'tree')
  if (human && tree && !next.some(item => item.from === tree.id && item.to === human.id && item.kind === 'feeds')) {
    next.push({ from: tree.id, to: human.id, kind: 'feeds' })
  }
  return {
    nodes,
    relations: next,
    bound: next.some(item => item.kind === 'kin'),
    living: living.length,
    consciousnessClaim: false as const,
    uniqueFullMinds: false as const,
  }
}

export const compareKinship = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const composed = composeWithStructures(prompt)
  const kin = bindKinship(composed.nodes, composed.relations)
  return {
    bound: kin.bound,
    living: kin.living,
    consciousnessClaim: kin.consciousnessClaim,
  }
}
