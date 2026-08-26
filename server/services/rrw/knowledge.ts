import type { KnowledgeClaim } from './types.js'

const subjectOf = (statement: string) => {
  const boil = statement.match(/^(\S+)\s+boils/i)
  if (boil) return `boil:${boil[1].toUpperCase()}`
  const first = statement.trim().split(/\s+/)[0]?.toUpperCase()
  return first ?? statement
}

export const conflict = (a: KnowledgeClaim, b: KnowledgeClaim) =>
  a.statement !== b.statement && a.id !== b.id && subjectOf(a.statement) === subjectOf(b.statement)

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
