import { DThesisCore } from '../d-thesis/core.js'
import { applyDecision, detectEmergence } from './behavior.js'
import { applyFidelity } from './fidelity.js'
import { loadForFidelity, normalizePersonality } from './mind.js'
import { characterFiles } from './persist.js'
import type { NmnCharacter, SimulateInput, WorldEvent } from './types.js'

export const warEvent = (location = 'city-center'): WorldEvent => ({
  id: 'war-invasion',
  kind: 'invasion',
  location,
  danger: 0.88,
  opportunity: 0.25,
  medicalNeed: 0.8,
  combatNeed: 0.75,
  evidence: 0.82,
  rumorStrength: 0.4,
  authorityPresence: 0.35,
  scarcity: 0.4,
  dissatisfaction: 0.35,
  description: 'A cidade está sendo invadida.',
})

const character = (
  id: string,
  projectId: string,
  name: string,
  occupation: string,
  personality: Parameters<typeof normalizePersonality>[0],
  skills: Record<string, number>,
  relationships: NmnCharacter['relationships'],
  values: string[],
  location: string,
  seed: number,
): NmnCharacter => ({
  id,
  projectId,
  identity: { name, occupation, origin: 'city', ageBand: 'adult' },
  personality: normalizePersonality(personality),
  knowledge: { skills, facts: [] },
  relationships,
  needs: { safety: 0.7, energy: 0.7, social: 0.5, belonging: 0.6, resources: 0.5 },
  values,
  goals: [{ id: 'live', description: 'Continuar vivo e coerente com quem é', priority: 0.5, origin: 'identity' }],
  location,
  resources: [],
  memory: [],
  history: [],
  causal: [],
  fidelity: 'full',
  relevance: 1,
  seed,
  tick: 0,
})

export const warCast = (projectId: string): NmnCharacter[] => [
  character('npc-a', projectId, 'Amina', 'civil', { courage: 0.42, caution: 0.68, attachment: 0.88, composure: 0.6 }, { escapeRoutes: 0.92 }, [{ id: 'fam-a', target: 'child', kind: 'family', strength: 0.95, trust: 0.9, proximity: 'near', status: 'present' }], ['care'], 'city-center', 11),
  character('npc-b', projectId, 'Bento', 'civil', { courage: 0.48, caution: 0.5, attachment: 0.96, composure: 0.45 }, {}, [{ id: 'fam-b', target: 'partner', kind: 'family', strength: 0.97, trust: 0.9, proximity: 'unknown', status: 'missing' }], ['family'], 'city-center', 23),
  character('npc-c', projectId, 'Célia', 'médica', { courage: 0.55, caution: 0.4, altruism: 0.9, attachment: 0.35, composure: 0.72 }, { medicine: 0.93 }, [{ id: 'fam-c', target: 'parents', kind: 'family', strength: 0.4, trust: 0.7, proximity: 'far', status: 'distant' }], ['care', 'oath'], 'city-center', 37),
  character('npc-d', projectId, 'Dario', 'ex-militar', { courage: 0.84, caution: 0.35, loyalty: 0.78, altruism: 0.62, composure: 0.8 }, { combat: 0.88 }, [], ['duty'], 'city-center', 41),
  character('npc-e', projectId, 'Eva', 'civil', { courage: 0.12, caution: 0.92, composure: 0.12, denial: 0.1, attachment: 0.3 }, {}, [], ['safety'], 'city-center', 53),
  character('npc-f', projectId, 'Farid', 'civil', { courage: 0.4, caution: 0.5, attachment: 0.9, composure: 0.5 }, {}, [{ id: 'fam-f', target: 'sister', kind: 'family', strength: 0.9, trust: 0.85, proximity: 'far', status: 'distant' }], ['family'], 'city-center', 67),
  character('npc-g', projectId, 'Gita', 'comerciante', { courage: 0.35, caution: 0.4, denial: 0.92, composure: 0.55, curiosity: 0.2 }, {}, [], ['routine'], 'city-center', 71),
]

export class NmnCore {
  private thesis = new DThesisCore()

  simulate(input: SimulateInput) {
    const ticks = Math.max(1, Math.min(input.ticks ?? 1, 12))
    let characters = input.characters.map(item => structuredClone(item))
    const log: { tick: number; id: string; action: string; reason: string; awareness: string }[] = []
    for (let tick = 0; tick < ticks; tick++) {
      const observations = characters.map(item => item.lastAction ? { actorId: item.id, action: item.lastAction } : undefined).filter((item): item is NonNullable<typeof item> => Boolean(item))
      characters = characters.map(item => {
        const live = loadForFidelity(item)
        if (live.fidelity === 'dormant') return live
        const result = applyDecision(live, input.event, observations)
        log.push({ tick, id: result.character.id, action: result.action, reason: result.reason, awareness: result.perceived.awareness })
        return result.character
      })
    }
    const emergence = detectEmergence(characters, input.event)
    const files = Object.assign({}, ...characters.map(characterFiles))
    const dThesis = this.thesis.evaluate({
      objective: `Simular comportamento contextual NMN para ${input.event.kind}`,
      constraints: ['sem onisciência', 'sem script global', 'fidelidade D-O15', 'sem consciência subjetiva'],
      resources: ['CPU', 'estado persistente'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 8 },
    })
    return {
      format: 'ues-nmn-simulation-v1',
      thesisComplement: true,
      consciousnessClaim: false,
      voice: { status: 'adapter-required', provider: null, contract: ['intent', 'emotion', 'style'] },
      event: input.event,
      characters: characters.map(item => ({
        id: item.id,
        name: item.identity.name,
        occupation: item.identity.occupation,
        action: item.lastAction,
        reason: item.lastReason,
        fidelity: item.fidelity,
        awareness: log.filter(entry => entry.id === item.id).at(-1)?.awareness,
      })),
      distinctActions: [...new Set(characters.map(item => item.lastAction).filter(Boolean))],
      log,
      emergence,
      files: Object.keys(files),
      snapshot: characters,
      fileContents: files,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp, dO15: dThesis.dO15 },
      verification: {
        valid: characters.every(item => item.lastAction) && new Set(characters.map(item => item.lastAction)).size >= 2,
        omniscient: false,
        scriptedGlobalReaction: false,
      },
      absolutePerfectionClaim: false,
    }
  }

  war(projectId: string, ticks = 1) {
    const rumorFirst = warEvent()
    rumorFirst.evidence = 0.15
    rumorFirst.rumorStrength = 0.7
    rumorFirst.location = 'city-center'
    const first = this.simulate({ characters: warCast(projectId), event: rumorFirst, ticks: 1 })
    const invasion = this.simulate({ characters: first.snapshot, event: warEvent(), ticks })
    return { rumorPass: first, invasionPass: invasion }
  }

  setFidelity(characters: NmnCharacter[], relevanceById: Record<string, number>) {
    return characters.map(item => applyFidelity(item, relevanceById[item.id] ?? item.relevance))
  }
}
