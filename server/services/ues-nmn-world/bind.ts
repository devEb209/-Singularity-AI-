import { NmnCore, warCast } from '../nmn/core.js'
import type { WorldEvent } from '../nmn/types.js'
import { chooseRepresentation } from '../ues-represent/choose.js'

export const eventFromWorld = (kind: string, danger: number, location = 'city-center'): WorldEvent => ({
  id: `world-${kind}`,
  kind,
  location,
  danger,
  opportunity: Math.max(0, 0.4 - danger * 0.2),
  medicalNeed: danger * 0.7,
  combatNeed: danger * 0.65,
  evidence: 0.7,
  rumorStrength: 0.25,
  authorityPresence: 0.4,
  scarcity: danger * 0.35,
  dissatisfaction: danger * 0.3,
  description: `Evento de mundo: ${kind}`,
})

export const bindNmnToWorld = (projectId: string, kind = 'invasion', danger = 0.84) => {
  const event = eventFromWorld(kind, danger)
  const cast = warCast(projectId)
  const fidelity = cast.map((item, index) => chooseRepresentation({
    domain: 'npc',
    influence: index < 3 ? 0.85 : 0.2,
    distance: index < 3 ? 2 : 14,
    visible: index < 5,
    interactive: index < 3,
    reconstructable: true,
  }))
  const simulated = new NmnCore().simulate({ characters: cast, event, ticks: 2 })
  return {
    format: 'ues-nmn-world-v1' as const,
    event,
    fidelity: fidelity.map(item => item.kind),
    distinctActions: simulated.distinctActions,
    consciousnessClaim: false,
    verification: {
      valid: simulated.verification.valid && simulated.distinctActions.length >= 2 && fidelity.some(item => item.kind === 'dormant' || item.kind === 'simplified' || item.kind === 'procedural'),
      scriptedGlobalReaction: false,
    },
  }
}
