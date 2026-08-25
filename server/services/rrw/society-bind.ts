import { stepOrganisms } from './organism.js'
import type { RealityNode } from './types.js'

export const coupleSociety = (nodes: RealityNode[]) => {
  const living = stepOrganisms(nodes).filter(item => item.kind === 'living' || item.organism)
  const working = living.filter(item => item.organism?.action === 'grasp' || item.organism?.action === 'forage' || item.organism?.action === 'photosynthesize').length
  const seeking = living.filter(item => item.organism?.action.startsWith('seek')).length
  return {
    population: living.length,
    working,
    seeking,
    sameParadigm: living.every(item => item.organism?.consciousnessClaim === false),
    scriptedNpc: false as const,
    consciousnessClaim: false as const,
  }
}
