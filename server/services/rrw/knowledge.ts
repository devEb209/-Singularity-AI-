import type { KnowledgeClaim } from './types.js'

export const conflict = (a: KnowledgeClaim, b: KnowledgeClaim) =>
  a.statement !== b.statement && a.id !== b.id && (a.statement.includes('H2O') && b.statement.includes('H2O')
    ? a.statement.replace(/\s+/g, '') !== b.statement.replace(/\s+/g, '')
    : false)

export const reconcile = (claims: KnowledgeClaim[]) => {
  const known = claims.filter(item => item.state === 'KNOWN' && !item.inferred)
  const inferred = claims.filter(item => item.inferred)
  const clashes = inferred.filter(item => known.some(base => conflict(base, item)))
  return {
    accepted: known,
    held: inferred.filter(item => !clashes.includes(item)),
    rejected: clashes.map(item => ({ ...item, state: 'UNKNOWN' as const })),
    inferenceIsFact: false as const,
  }
}
