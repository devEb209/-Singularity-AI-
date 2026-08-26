import type { KnowledgeClass, KnowledgeItem } from './types.js'
import { createHash } from 'node:crypto'

export interface IncomingClaim {
  claim: string
  sources: { independent: boolean; tested?: boolean; contradicts?: boolean }[]
  inferred?: boolean
}

export const classifyClaim = (input: IncomingClaim): KnowledgeItem => {
  const independent = input.sources.filter(item => item.independent).length
  const tested = input.sources.some(item => item.tested)
  const contradiction = input.sources.some(item => item.contradicts)
  let classification: KnowledgeClass = 'speculation'
  let reason = 'No usable source.'
  if (contradiction) {
    classification = 'uncertain'
    reason = 'Sources disagree; do not promote to fact.'
  } else if (tested && independent >= 2) {
    classification = 'established'
    reason = 'Independent agreement plus a test.'
  } else if (independent >= 2) {
    classification = 'strong-evidence'
    reason = 'Two or more independent sources.'
  } else if (independent === 1) {
    classification = 'moderate-evidence'
    reason = 'Single source is not enough to treat as fact.'
  } else if (input.inferred) {
    classification = 'hypothesis'
    reason = 'Inferred without independent source.'
  }
  return {
    id: createHash('sha256').update(input.claim).digest('hex').slice(0, 16),
    claim: input.claim,
    classification,
    sourceCount: input.sources.length,
    independentSources: independent,
    tested,
    usableAsFact: classification === 'established' || classification === 'strong-evidence',
    reason,
  }
}

export const rejectFactPromotion = (item: KnowledgeItem) => !item.usableAsFact

export const skipRedundantResearch = (existing: KnowledgeItem[], claim: string) => {
  const found = existing.find(item => item.claim === claim && item.usableAsFact)
  return Boolean(found)
}
