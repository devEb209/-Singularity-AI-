import { composeWithStructures } from './structure.js'
import type { RealityNode } from './types.js'

export const shareCulture = (nodes: RealityNode[], fromId = 'human', toId = 'animal') => {
  const from = nodes.find(item => item.id === fromId)
  const statement = from?.claims.find(item => !item.inferred)?.statement ?? 'shared coastal practice'
  const claim = {
    id: `culture-${fromId}-${toId}`,
    statement: `culture: ${statement}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'culture-claim',
  }
  return {
    nodes: nodes.map(node => (node.id === toId ? { ...node, claims: [...node.claims, claim] } : node)),
    shared: Boolean(from),
    consciousnessClaim: false as const,
    uniqueFullMinds: false as const,
  }
}

export const compareCulture = (prompt = 'oceano salgado com um humano') => {
  const composed = composeWithStructures(prompt)
  const shared = shareCulture(composed.nodes)
  const animal = shared.nodes.find(item => item.id === 'animal')
  return {
    shared: Boolean(animal?.claims.some(item => item.statement.startsWith('culture:'))),
    consciousnessClaim: shared.consciousnessClaim,
  }
}
