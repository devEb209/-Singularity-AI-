import { composeWithStructures } from './structure.js'
import { sumMoles } from './pool.js'
import { stepTectonics } from './tectonics.js'
import type { RealityNode } from './types.js'

export const stepEarthquake = (nodes: RealityNode[]) => {
  const slipped = stepTectonics(nodes, 0.12)
  const next = slipped.nodes.map(node => (
    node.id === 'shelter' || node.id === 'outcrop'
      ? { ...node, claims: [...node.claims, { id: 'quake', statement: 'ground slip recorded as a knowledge claim', state: 'KNOWN' as const, inferred: false, source: 'earthquake' }] }
      : node
  ))
  return {
    nodes: next,
    conserved: Math.abs(sumMoles(next, 'SiO2') - sumMoles(nodes, 'SiO2')) < 1e-9,
    slipped: slipped.slipped,
    remembered: next.some(item => item.claims.some(claim => claim.id === 'quake')),
    cinematicShake: false as const,
  }
}

export const compareEarthquake = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepEarthquake(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, slipped: stepped.slipped, remembered: stepped.remembered, cinematicShake: stepped.cinematicShake }
}
