import type { RepresentationChoice, RepresentationKind, RepresentationNeed } from './types.js'

const kindOf = (need: RepresentationNeed): RepresentationKind => {
  if (!need.visible && !need.interactive && need.reconstructable) return 'dormant'
  if (!need.visible && need.reconstructable) return 'reconstructable'
  if (need.influence < 0.18 && need.distance > 8) return 'procedural'
  if (need.influence < 0.35 && !need.interactive) return 'simplified'
  if (need.influence < 0.55 && need.distance > 4) return 'instanced'
  return 'full'
}

export const chooseRepresentation = (need: RepresentationNeed): RepresentationChoice => {
  const kind = kindOf(need)
  const resident = kind === 'full' || kind === 'simplified' || kind === 'instanced'
  const simulate = need.interactive || (kind === 'full' && need.influence >= 0.4)
  const render = need.visible && kind !== 'dormant'
  const store = kind === 'full' || !need.reconstructable
  return {
    domain: need.domain,
    kind,
    resident,
    simulate,
    render,
    store,
    reason: render
      ? `perceptual influence ${need.influence.toFixed(2)} at distance ${need.distance}`
      : 'does not influence the required experience; reconstruct later',
  }
}

export const chooseMany = (needs: RepresentationNeed[]) => needs.map(chooseRepresentation)

export const counts = (choices: RepresentationChoice[]) => ({
  full: choices.filter(item => item.kind === 'full').length,
  simplified: choices.filter(item => item.kind === 'simplified').length,
  dormant: choices.filter(item => item.kind === 'dormant').length,
  reconstructable: choices.filter(item => item.kind === 'reconstructable').length,
  procedural: choices.filter(item => item.kind === 'procedural').length,
  instanced: choices.filter(item => item.kind === 'instanced').length,
  drawn: choices.filter(item => item.render).length,
  simulated: choices.filter(item => item.simulate).length,
})
