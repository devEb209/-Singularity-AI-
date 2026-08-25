import { molesOf } from './extent.js'
import { composeWithStructures } from './structure.js'
import type { RealityNode } from './types.js'

export const answerWorld = (nodes: RealityNode[], question: string) => {
  const hay = question.toLowerCase()
  const shelter = nodes.find(item => item.id === 'shelter')
  const ocean = nodes.find(item => item.id === 'ocean')
  const living = nodes.filter(item => item.kind === 'living' || item.living)
  if (hay.includes('abrigo') || hay.includes('shelter') || hay.includes('onde')) {
    return {
      kind: 'place' as const,
      id: shelter?.id ?? null,
      found: Boolean(shelter),
      phase: shelter?.phase,
    }
  }
  if (hay.includes('água') || hay.includes('agua') || hay.includes('water') || hay.includes('oceano')) {
    return {
      kind: 'quantity' as const,
      id: 'ocean',
      found: Boolean(ocean),
      moles: ocean ? molesOf(ocean, 'H2O') : 0,
      phase: ocean?.phase,
    }
  }
  if (hay.includes('quem') || hay.includes('vivo') || hay.includes('living')) {
    return {
      kind: 'census' as const,
      id: 'living',
      found: living.length > 0,
      count: living.length,
      identities: living.map(item => item.living?.identity ?? item.id),
    }
  }
  return { kind: 'unknown' as const, id: null, found: false }
}

export const queryComposed = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const composed = composeWithStructures(prompt)
  const place = answerWorld(composed.nodes, 'onde está o abrigo')
  const water = answerWorld(composed.nodes, 'quanta água no oceano')
  const census = answerWorld(composed.nodes, 'quem está vivo')
  return {
    place,
    water,
    census,
    foundShelter: place.found,
    hasWater: (water.moles ?? 0) > 0,
    hasLiving: (census.count ?? 0) > 0,
    meshQuery: false as const,
  }
}
