import type { NmnCharacter, NmnFidelity } from './types.js'

const rank: Record<NmnFidelity, number> = { dormant: 0, low: 1, medium: 2, high: 3, full: 4 }

export const fidelityForRelevance = (relevance: number): NmnFidelity => {
  if (relevance >= 0.85) return 'full'
  if (relevance >= 0.65) return 'high'
  if (relevance >= 0.4) return 'medium'
  if (relevance >= 0.15) return 'low'
  return 'dormant'
}

export const applyFidelity = (character: NmnCharacter, relevance: number) => {
  const next = fidelityForRelevance(relevance)
  const previous = character.fidelity
  character.relevance = relevance
  character.fidelity = next
  return {
    id: character.id,
    from: previous,
    to: next,
    preservedIdentity: character.identity.name,
    preservedValues: character.values,
    preservedRelationships: character.relationships.length,
    continuity: true,
    rule: 'D-O15 changes simulation fidelity, not who the character is.',
  }
}

export const compareFidelity = (a: NmnFidelity, b: NmnFidelity) => rank[a] - rank[b]
