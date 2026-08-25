import { reconcile } from './knowledge.js'
import { phaseAt } from './matter.js'
import { budgetOf, residual } from './quantities.js'
import { requireSubstance } from './substances.js'
import type { KnowledgeClaim, QuantityBudget, RealityNode } from './types.js'

export interface CriticFinding {
  code: string
  severity: 'info' | 'warning' | 'error'
  message: string
}

export const critiqueReality = (nodes: RealityNode[], before?: QuantityBudget, after?: QuantityBudget, extraClaims: KnowledgeClaim[] = []) => {
  const findings: CriticFinding[] = []
  for (const node of nodes) {
    if (node.living?.consciousnessClaim || node.organism?.consciousnessClaim) {
      findings.push({ code: 'consciousness-claim', severity: 'error', message: `${node.id} claimed consciousness` })
    }
    if (node.substanceId) {
      const expected = phaseAt(requireSubstance(node.substanceId), node.temperatureK)
      if (node.phase !== expected && node.phase !== 'mixture') {
        findings.push({ code: 'phase-mismatch', severity: 'warning', message: `${node.id} phase ${node.phase} expected ${expected}` })
      }
    }
    if ('albedo' in node || 'roughness' in node || 'metalness' in node) {
      findings.push({ code: 'pbr-foundation', severity: 'error', message: `${node.id} carries PBR layers as foundation` })
    }
  }
  const claims = [...nodes.flatMap(item => item.claims), ...extraClaims]
  const knowledge = reconcile(claims)
  if (knowledge.rejected.length) findings.push({ code: 'rejected-inference', severity: 'info', message: `${knowledge.rejected.length} inferred claims rejected` })
  if (before && after) {
    const gap = residual(before, after)
    if (gap.mass > 1e-3) findings.push({ code: 'mass-residual', severity: 'warning', message: `mass residual ${gap.mass}` })
  }
  const errors = findings.filter(item => item.severity === 'error')
  return {
    findings,
    accepted: errors.length === 0,
    knowledge,
    inferenceIsFact: false as const,
    traditionalPipeline: false as const,
  }
}

export const refineReality = (nodes: RealityNode[]) => {
  const next = nodes.map(node => {
    if (!node.substanceId) return { ...node, living: node.living ? { ...node.living, consciousnessClaim: false as const } : undefined }
    const phase = phaseAt(requireSubstance(node.substanceId), node.temperatureK)
    return {
      ...node,
      phase,
      living: node.living ? { ...node.living, consciousnessClaim: false as const } : undefined,
      organism: node.organism ? { ...node.organism, consciousnessClaim: false as const } : undefined,
    }
  })
  return { nodes: next, budget: budgetOf(next) }
}
