import { critiqueReality, refineReality } from './critic.js'
import { budgetOf } from './quantities.js'
import type { KnowledgeClaim, RealityNode } from './types.js'

const fixtureClaims = (): KnowledgeClaim[] => [
  { id: 'k1', statement: 'H2O boils at 373.15K', state: 'KNOWN', inferred: false, source: 'internal-reference' },
  { id: 'k2', statement: 'H2O boils at 10K', state: 'LIKELY', inferred: true, source: 'unchecked-inference' },
]

export const applyRefine = (nodes: RealityNode[], extraClaims: KnowledgeClaim[] = fixtureClaims()) => {
  const before = critiqueReality(nodes, undefined, undefined, extraClaims)
  const refined = refineReality(nodes)
  const rejected = new Set(before.knowledge.rejected.map(item => item.id))
  const cleaned = refined.nodes.map(node => ({
    ...node,
    claims: node.claims.filter(item => !rejected.has(item.id) && !(item.inferred && item.statement.includes('10K'))),
  }))
  const after = critiqueReality(cleaned, budgetOf(nodes), refined.budget, extraClaims)
  return {
    nodes: cleaned,
    before: before.findings.length,
    after: after.findings.filter(item => item.code === 'phase-mismatch').length,
    rejected: before.knowledge.rejected.length,
    phasesFixed: before.findings.some(item => item.code === 'phase-mismatch') && after.findings.every(item => item.code !== 'phase-mismatch'),
    inferenceIsFact: false as const,
  }
}
