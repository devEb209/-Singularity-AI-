import { composeWithStructures } from './structure.js'
import { distanceBetween } from './extent.js'
import { stepOrganisms } from './organism.js'
import type { RealityNode } from './types.js'

export const stepPain = (nodes: RealityNode[]) => {
  const bound = stepOrganisms(nodes)
  const human = bound.find(item => item.id === 'human')
  const fire = bound.find(item => item.id === 'fire')
  const nearFire = Boolean(human && fire && distanceBetween(human, fire) < 2)
  const integrity = human?.organism?.systems.reduce((sum, item) => sum + item.integrity, 0) ?? 1
  const signal = nearFire || integrity < 4.2
  const claim = {
    id: 'pain-human',
    statement: `nociception: nearFire=${nearFire} integrity=${integrity.toFixed(2)}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'pain-signal',
  }
  return {
    nodes: bound.map(node => (node.id === 'human' ? { ...node, claims: [...node.claims, claim] } : node)),
    signal,
    consciousnessClaim: false as const,
    medicalDiagnosis: false as const,
  }
}

export const comparePain = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const stepped = stepPain(composeWithStructures(prompt).nodes)
  return { signal: stepped.signal, consciousnessClaim: stepped.consciousnessClaim, medicalDiagnosis: stepped.medicalDiagnosis }
}
