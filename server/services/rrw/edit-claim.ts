import { composeWithStructures } from './structure.js'
import { applyRefine } from './apply-refine.js'
import type { RealityNode } from './types.js'

export const addKnownClaim = (nodes: RealityNode[], nodeId: string, statement: string) => {
  const claim = {
    id: `edit-${nodeId}-${statement.slice(0, 24)}`,
    statement,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'edit-claim',
  }
  const next = nodes.map(node => (node.id === nodeId ? { ...node, claims: [...node.claims, claim] } : node))
  const refined = applyRefine(next)
  return {
    nodes: refined.nodes,
    kept: refined.nodes.some(item => item.id === nodeId && item.claims.some(entry => entry.statement === statement)),
    settled: refined.after === 0,
    meshViewport: false as const,
    aaaEditor: false as const,
  }
}

export const compareEditClaim = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const composed = composeWithStructures(prompt)
  const edited = addKnownClaim(composed.nodes, 'shelter', 'shelter faces the grove')
  return { kept: edited.kept, settled: edited.settled, aaaEditor: edited.aaaEditor }
}
