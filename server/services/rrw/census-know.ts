import { composeWithStructures } from './structure.js'
import type { RealityNode } from './types.js'

export const censusOf = (nodes: RealityNode[]) => {
  const living = nodes.filter(item => item.kind === 'living' || item.living)
  return {
    count: living.length,
    identities: living.map(item => item.living?.identity ?? item.id),
    uniqueFullMinds: false as const,
  }
}

export const stepCensus = (nodes: RealityNode[]) => {
  const census = censusOf(nodes)
  const claim = {
    id: 'census-living',
    statement: `census living=${census.count}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'census-know',
  }
  const host = nodes.some(item => item.id === 'chronicle') ? 'chronicle' : 'human'
  return {
    nodes: nodes.map(node => (node.id === host ? { ...node, claims: [...node.claims, claim] } : node)),
    ...census,
  }
}

export const compareCensus = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const stepped = stepCensus(composeWithStructures(prompt).nodes)
  return { count: stepped.count, hasHuman: stepped.identities.some(item => item.includes('walker') || item === 'human'), uniqueFullMinds: stepped.uniqueFullMinds }
}
