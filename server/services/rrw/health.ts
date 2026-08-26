import { needsFromReality } from './bind-needs.js'
import { composeWithStructures } from './structure.js'
import { applyTimeClimate, climateBaseOf } from './season.js'
import { stepOrganisms } from './organism.js'
import type { RealityNode } from './types.js'

const integrityOf = (node: RealityNode | undefined, id: string) =>
  node?.organism?.systems.find(item => item.id === id)?.integrity ?? 0

export const stepHealth = (nodes: RealityNode[]) => {
  const bound = stepOrganisms(nodes)
  const next = bound.map(node => {
    if (!node.organism) return node
    const needs = needsFromReality(node, bound)
    const systems = node.organism.systems.map(sys => {
      if (sys.id === 'metabolic') return { ...sys, integrity: needs.energy }
      if (sys.id === 'respiratory') return { ...sys, integrity: needs.oxygen }
      if (sys.id === 'photosynthetic') return { ...sys, integrity: Math.max(0.2, Math.min(1, needs.water)) }
      if (sys.id === 'circulatory') return { ...sys, integrity: needs.temperatureOk ? 1 : 0.55 }
      return sys
    })
    return {
      ...node,
      organism: {
        ...node.organism,
        needs,
        systems,
        consciousnessClaim: false as const,
      },
    }
  })
  const human = next.find(item => item.id === 'human')
  const tree = next.find(item => item.id === 'tree')
  return {
    nodes: next,
    humanCirculatory: integrityOf(human, 'circulatory'),
    humanMetabolic: integrityOf(human, 'metabolic'),
    treePhotosynthetic: integrityOf(tree, 'photosynthetic'),
    consciousnessClaim: false as const,
    medicalDiagnosis: false as const,
  }
}

export const compareHealth = () => {
  const coast = stepHealth(composeWithStructures('oceano salgado com um humano e um abrigo').nodes)
  const alpineSeed = composeWithStructures('neve alpina no cume com um humano')
  const alpineNodes = applyTimeClimate(alpineSeed.nodes, climateBaseOf(alpineSeed.nodes), { hour: 2, dayOfYear: 15, moon: 0 })
  const alpine = stepHealth(alpineNodes)
  return {
    alpineCirculatoryLower: alpine.humanCirculatory < coast.humanCirculatory,
    coastCirculatory: coast.humanCirculatory,
    alpineCirculatory: alpine.humanCirculatory,
    consciousnessClaim: false as const,
    medicalDiagnosis: false as const,
  }
}
