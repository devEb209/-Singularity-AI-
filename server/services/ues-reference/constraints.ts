import type { ExtractedConstraint, ReferenceCard } from './types.js'

export const extractConstraints = (cards: ReferenceCard[]): ExtractedConstraint[] => {
  const constraints: ExtractedConstraint[] = []
  for (const card of cards) {
    if (card.kind === 'proportion') {
      for (const [key, value] of Object.entries(card.values)) {
        constraints.push({ id: `${card.id}-${key}`, kind: 'proportion', rule: `bone-ratio:${key}`, value, sourceCard: card.id })
      }
    }
    if (card.kind === 'palette') {
      constraints.push({ id: `${card.id}-hex`, kind: 'palette', rule: 'allowed-hex', value: card.values.hex, sourceCard: card.id })
    }
    if (card.kind === 'silhouette') {
      constraints.push({ id: `${card.id}-aspect`, kind: 'silhouette', rule: 'bbox-aspect', value: card.values.aspect, sourceCard: card.id })
    }
  }
  return constraints
}

export const constraintDistance = (a: ExtractedConstraint[], b: ExtractedConstraint[]) => {
  const keys = new Set([...a, ...b].map(item => item.rule))
  let acc = 0
  for (const key of keys) {
    const left = a.find(item => item.rule === key)
    const right = b.find(item => item.rule === key)
    if (!left || !right) {
      acc += 1
      continue
    }
    if (typeof left.value === 'number' && typeof right.value === 'number') acc += Math.abs(left.value - right.value)
    else acc += JSON.stringify(left.value) === JSON.stringify(right.value) ? 0 : 1
  }
  return Number(acc.toFixed(4))
}
