import { chooseRepresentation } from '../ues-represent/choose.js'
import type { DomainKind, RepresentationKind } from '../ues-represent/types.js'

export interface ScaleNeed {
  id: string
  domain: DomainKind
  influence: number
  distance: number
  visible: boolean
  interactive: boolean
}

export const planScale = (needs: ScaleNeed[], budget: { full: number; reduced: number }) => {
  const ranked = [...needs].sort((a, b) => b.influence - a.influence || a.distance - b.distance)
  let full = 0
  let reduced = 0
  return ranked.map(need => {
    const base = chooseRepresentation({
      domain: need.domain,
      influence: need.influence,
      distance: need.distance,
      visible: need.visible,
      interactive: need.interactive,
      reconstructable: true,
    })
    let kind: RepresentationKind = base.kind
    if (kind === 'full') {
      if (full < budget.full) full += 1
      else if (reduced < budget.reduced) {
        kind = 'simplified'
        reduced += 1
      } else kind = 'dormant'
    }
    return { id: need.id, domain: need.domain, kind, reason: `needed=${needs.length}; budget full ${budget.full}` }
  })
}

export const noFixedCap = (needs: ScaleNeed[]) => needs.length
