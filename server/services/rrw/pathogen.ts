import { composeWithStructures } from './structure.js'
import { stepOrganisms } from './organism.js'
import type { RealityNode } from './types.js'

export const stepPathogen = (nodes: RealityNode[]) => {
  const bound = stepOrganisms(nodes)
  const next = bound.map(node => {
    if (node.id !== 'human' || !node.organism) return node
    return {
      ...node,
      organism: {
        ...node.organism,
        systems: node.organism.systems.map(sys => (sys.id === 'respiratory' ? { ...sys, integrity: Math.max(0.25, sys.integrity * 0.72) } : sys)),
        consciousnessClaim: false as const,
      },
      claims: [...node.claims, { id: 'pathogen-load', statement: 'respiratory integrity reduced by a pathogen load', state: 'KNOWN' as const, inferred: false, source: 'pathogen' }],
    }
  })
  const before = bound.find(item => item.id === 'human')?.organism?.systems.find(item => item.id === 'respiratory')?.integrity ?? 1
  const after = next.find(item => item.id === 'human')?.organism?.systems.find(item => item.id === 'respiratory')?.integrity ?? 1
  return { nodes: next, weaker: after < before, medicalDiagnosis: false as const, consciousnessClaim: false as const }
}

export const comparePathogen = () => {
  const stepped = stepPathogen(composeWithStructures('oceano salgado com um humano e um abrigo').nodes)
  return { weaker: stepped.weaker, medicalDiagnosis: stepped.medicalDiagnosis }
}
