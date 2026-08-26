import { composeWithStructures } from './structure.js'
import { stepOrganisms } from './organism.js'
import type { RealityNode } from './types.js'

export const stepAging = (nodes: RealityNode[], years = 0.02) => {
  const bound = stepOrganisms(nodes)
  const factor = Math.max(0.2, 1 - Math.max(0, years) * 0.15)
  const next = bound.map(node => {
    if (!node.organism) return node
    return {
      ...node,
      organism: {
        ...node.organism,
        systems: node.organism.systems.map(sys => ({ ...sys, integrity: Math.max(0.2, sys.integrity * factor) })),
        consciousnessClaim: false as const,
      },
    }
  })
  const human = next.find(item => item.id === 'human')
  const integrity = human?.organism?.systems.reduce((sum, item) => sum + item.integrity, 0) ?? 0
  return { nodes: next, integrity, aged: years > 0, consciousnessClaim: false as const, medicalDiagnosis: false as const }
}

export const compareAging = () => {
  const nodes = composeWithStructures('oceano salgado com um humano e um abrigo').nodes
  const young = stepAging(nodes, 0)
  const old = stepAging(nodes, 0.4)
  return {
    olderWeaker: old.integrity < young.integrity,
    consciousnessClaim: false as const,
    medicalDiagnosis: false as const,
  }
}
