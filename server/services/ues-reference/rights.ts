import type { ReferenceCard, RightsVerdict } from './types.js'

export const rightsVerdict = (cards: ReferenceCard[]): RightsVerdict => {
  const blocked = cards.filter(card => card.license === 'unknown' || card.license === 'all-rights-reserved')
  return {
    allowed: blocked.length === 0,
    blocked: blocked.map(card => card.id),
    reasons: blocked.map(card => `${card.id}: ${card.license} cannot enter a production artifact`),
    vision: false,
  }
}
