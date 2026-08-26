import { composeWithStructures } from './structure.js'
import type { RealityNode } from './types.js'

export const rememberAction = (nodes: RealityNode[], actorId: string, action: string) => {
  const claim = {
    id: `memory-${actorId}-${action}`,
    statement: `trace: ${action}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'memory-trace',
  }
  return {
    nodes: nodes.map(node => (node.id === actorId ? { ...node, claims: [...node.claims, claim] } : node)),
    remembered: nodes.some(item => item.id === actorId),
    consciousnessClaim: false as const,
    uniqueFullMinds: false as const,
  }
}

export const compareMemoryTrace = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const composed = composeWithStructures(prompt)
  const remembered = rememberAction(composed.nodes, 'human', 'forage')
  const human = remembered.nodes.find(item => item.id === 'human')
  return {
    remembered: Boolean(human?.claims.some(item => item.statement.includes('forage'))),
    consciousnessClaim: remembered.consciousnessClaim,
  }
}
