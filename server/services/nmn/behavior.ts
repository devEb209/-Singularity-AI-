import { addFact, clamp01, familyState, perceive, remember } from './mind.js'
import type { NmnAction, NmnCharacter, PerceivedEvent, SocialObservation, WorldEvent } from './types.js'

export const ACTIONS: NmnAction[] = [
  'flee', 'hide', 'protect-family', 'search-missing', 'aid-wounded', 'defend', 'seek-info',
  'continue-routine', 'loot', 'freeze', 'follow-crowd', 'evacuate-with-family', 'travel-to-family', 'help-evacuation',
]

const jitter = (seed: number, salt: string) => {
  let h = seed >>> 0
  for (const char of salt) h = Math.imul(h ^ char.charCodeAt(0), 16777619)
  return ((h >>> 0) / 4294967296 - 0.5) * 0.04
}

const majority = (observations: SocialObservation[]) => {
  if (!observations.length) return { action: undefined as NmnAction | undefined, ratio: 0 }
  const counts = new Map<NmnAction, number>()
  for (const item of observations) counts.set(item.action, (counts.get(item.action) ?? 0) + 1)
  const [action, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  return { action, ratio: count / observations.length }
}

export const scoreActions = (character: NmnCharacter, perceived: PerceivedEvent, observations: SocialObservation[]) => {
  const p = character.personality
  const skills = character.knowledge.skills
  const family = familyState(character)
  const route = skills.escapeRoutes ?? 0
  const medical = skills.medicine ?? 0
  const combat = skills.combat ?? 0
  const crowd = majority(observations)
  const honorLock = character.values.includes('honor') && !character.history.some(item => item.kind === 'moral-break')
  const fear = clamp01(perceived.danger * (1.15 - p.courage) * (1.05 - p.composure * 0.5) * (1 - combat * 0.25))
  const raw: Record<NmnAction, number> = {
    flee: p.caution * 0.32 + fear * 0.38 + (1 - p.courage) * 0.18 + perceived.danger * 0.12 - (family.nearby ? 0.28 : 0) - (family.missing ? 0.38 : 0),
    hide: p.caution * 0.38 + fear * 0.34 + (1 - p.composure) * 0.28,
    'protect-family': family.nearby ? p.attachment * 0.55 + p.loyalty * 0.22 + 0.18 : -1,
    'search-missing': family.missing ? p.attachment * 0.62 + p.loyalty * 0.18 + p.courage * 0.1 + 0.2 : -1,
    'aid-wounded': medical >= 0.3 ? p.altruism * 0.38 + medical * 0.46 + perceived.medicalNeed * 0.28 : medical * 0.04,
    defend: combat >= 0.4 ? p.courage * 0.38 + combat * 0.4 + p.loyalty * 0.2 : combat * 0.08 + p.courage * 0.08,
    'seek-info': p.curiosity * 0.52 + (1 - p.denial) * 0.18 + (perceived.certainty < 0.45 ? 0.22 : 0),
    'continue-routine': p.denial * 0.58 + (1 - perceived.danger) * 0.28 + (perceived.certainty < 0.3 ? 0.28 : 0) - perceived.evidence * 0.42,
    loot: honorLock ? -1 : p.greed * 0.62 + (1 - p.altruism) * 0.2 + perceived.opportunity * 0.22,
    freeze: fear * 0.46 + (1 - p.composure) * 0.4 + (1 - combat) * 0.08,
    'follow-crowd': crowd.action ? (1 - p.courage) * 0.18 + character.needs.social * 0.32 + crowd.ratio * 0.34 : -0.2,
    'evacuate-with-family': family.nearby && route >= 0.45 ? p.attachment * 0.38 + route * 0.36 + p.caution * 0.2 : family.nearby ? 0.12 : -1,
    'travel-to-family': family.far && !family.nearby && !family.missing ? p.attachment * 0.62 + 0.28 : -1,
    'help-evacuation': combat >= 0.4 && p.altruism >= 0.4 ? combat * 0.28 + p.altruism * 0.3 + p.loyalty * 0.22 : -0.25,
  }
  if (perceived.awareness === 'unknown') {
    raw['continue-routine'] += 0.85
    for (const action of ACTIONS) if (action !== 'continue-routine' && action !== 'seek-info') raw[action] -= 0.55
  }
  if (perceived.awareness === 'rumor' && p.denial >= 0.6) raw['continue-routine'] += 0.38
  if (perceived.awareness === 'witnessed' || perceived.evidence >= 0.7) raw['continue-routine'] -= 0.5
  if (character.fidelity === 'low') {
    raw.flee += character.needs.safety < 0.35 ? 0.15 : 0
    raw.hide += character.needs.safety < 0.25 ? 0.1 : 0
  }
  const scored = ACTIONS.map(action => ({
    action,
    score: Number((raw[action] + jitter(character.seed, `${character.id}:${perceived.eventId}:${action}:${character.tick}`)).toFixed(4)),
  })).sort((a, b) => b.score - a.score)
  return scored
}

export const decide = (character: NmnCharacter, event: WorldEvent, observations: SocialObservation[] = []) => {
  const perceived = perceive(character, event)
  const ranked = scoreActions(character, perceived, observations)
  const chosen = ranked[0]
  const reason = reasonFor(character, perceived, chosen.action)
  return { perceived, ranked, action: chosen.action, score: chosen.score, reason }
}

const reasonFor = (character: NmnCharacter, perceived: PerceivedEvent, action: NmnAction) => {
  const family = familyState(character)
  if (perceived.awareness === 'unknown') return 'Sem percepção do evento; mantém a continuidade da rotina.'
  if (action === 'aid-wounded') return 'Conhecimento médico e altruísmo tornam o cuidado a ação de maior utilidade contextual.'
  if (action === 'defend' || action === 'help-evacuation') return 'Experiência de combate e lealdade elevam a defesa/evacuação acima da fuga.'
  if (action === 'search-missing') return 'Vínculo familiar com pessoa desaparecida supera o impulso de fuga.'
  if (action === 'evacuate-with-family' || action === 'protect-family') return 'Família próxima e conhecimento de rota tornam a proteção a melhor ação local.'
  if (action === 'travel-to-family') return 'A família está em outra região; o objetivo dominante é alcançá-la.'
  if (action === 'hide' || action === 'freeze') return 'Baixa compostura e alto perigo percebido produzem retraimento, não um script global de fuga.'
  if (action === 'continue-routine') return 'Negação ou evidência insuficiente impede abandonar a rotina.'
  if (action === 'loot') return 'Ganância contextual superou valores restritivos.'
  if (action === 'follow-crowd') return 'Observação social e baixa autonomia situacional levam a seguir o grupo.'
  if (action === 'flee') return family.nearby ? 'Perigo percebido supera outros objetivos imediatos.' : 'Cautela e perigo percebido favorecem a saída.'
  return 'Ação emergiu da combinação de identidade, conhecimento, percepção e contexto.'
}

export const applyDecision = (character: NmnCharacter, event: WorldEvent, observations: SocialObservation[] = []) => {
  const decision = decide(character, event, observations)
  character.tick += 1
  character.lastAction = decision.action
  character.lastReason = decision.reason
  remember(character, `${event.kind}: ${decision.action} (${decision.perceived.awareness})`, Math.max(decision.perceived.danger, 0.35))
  if (decision.perceived.awareness !== 'unknown') {
    addFact(character, { content: `evento:${event.kind}`, confidence: decision.perceived.certainty, source: decision.perceived.awareness === 'witnessed' ? 'witnessed' : 'rumor', domain: 'current-event' })
  }
  if (decision.action === 'search-missing' || decision.action === 'travel-to-family') {
    character.goals = [{ id: 'family', description: 'Reencontrar família', priority: 0.95, origin: 'relationship' }, ...character.goals.filter(item => item.id !== 'family')]
  }
  if (decision.perceived.awareness === 'witnessed' && decision.perceived.danger > 0.6) {
    character.personality.denial = clamp01(character.personality.denial - 0.2)
    character.needs.safety = clamp01(character.needs.safety - 0.15)
  }
  character.causal.push(
    { from: event.id, to: `mem-${character.tick - 1}-`, relation: 'experience' },
    { from: `perception:${decision.perceived.awareness}`, to: decision.action, relation: 'behavior' },
  )
  character.history.push({ id: `h-${character.tick}`, tick: character.tick, kind: 'decision', content: `${decision.action}:${decision.reason}` })
  return { character, ...decision }
}

export const detectEmergence = (characters: NmnCharacter[], event: WorldEvent) => {
  const actions = characters.map(item => item.lastAction).filter((item): item is NmnAction => Boolean(item))
  const fleeing = actions.filter(item => item === 'flee' || item === 'evacuate-with-family' || item === 'hide').length
  const aiding = actions.filter(item => item === 'aid-wounded' || item === 'help-evacuation').length
  const defending = actions.filter(item => item === 'defend').length
  const dissatisfied = characters.filter(item => item.needs.resources < 0.35 || item.needs.safety < 0.3).length
  const leaders = characters.filter(item => (item.knowledge.skills.combat ?? 0) > 0.6 && item.personality.courage > 0.6).length
  const rumor = characters.filter(item => item.knowledge.facts.some(fact => fact.source === 'rumor')).length
  const unrest = characters.length >= 4 && dissatisfied / characters.length >= 0.5 && event.scarcity >= 0.55 && rumor >= 2 && leaders >= 1
  const evacuationWave = characters.length >= 4 && fleeing / characters.length >= 0.6
  const mutualAid = aiding >= 2 && defending >= 1
  return {
    unrest,
    evacuationWave,
    mutualAid,
    counts: { fleeing, aiding, defending, dissatisfied, leaders, rumor },
    scriptedRevolt: false,
    note: unrest ? 'Insatisfação + escassez + rumor + liderança produziram inquietação. Não foi um evento datado.' : 'Nenhum evento coletivo cruzou o limiar.',
  }
}
