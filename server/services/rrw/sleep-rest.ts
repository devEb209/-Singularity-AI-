import { composeWithStructures } from './structure.js'
import { stepOrganisms } from './organism.js'
import type { RealityNode } from './types.js'

export const stepSleep = (nodes: RealityNode[], hour = 2) => {
  const night = hour < 6 || hour >= 21
  const bound = stepOrganisms(nodes)
  const next = bound.map(node => {
    if (node.id !== 'human' || !node.organism) return node
    const systems = node.organism.systems.map(sys => ({
      ...sys,
      integrity: night ? Math.min(1, sys.integrity + 0.08) : Math.max(0.2, sys.integrity - 0.03),
    }))
    return { ...node, organism: { ...node.organism, systems, action: night ? 'rest' : node.organism.action, consciousnessClaim: false as const } }
  })
  const integrity = (item: RealityNode | undefined) => item?.organism?.systems.reduce((sum, sys) => sum + sys.integrity, 0) ?? 0
  return {
    nodes: next,
    night,
    rested: night && integrity(next.find(item => item.id === 'human')) >= integrity(bound.find(item => item.id === 'human')),
    consciousnessClaim: false as const,
  }
}

export const compareSleep = () => {
  const nodes = composeWithStructures('oceano salgado com um humano e um abrigo').nodes
  const night = stepSleep(nodes, 2)
  const day = stepSleep(nodes, 13)
  return { nightRests: night.rested, dayDoesNot: !day.rested, consciousnessClaim: false as const }
}
