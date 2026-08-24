import type { KnowledgeFact, MemoryItem, NmnCharacter, PerceivedEvent, Personality, WorldEvent } from './types.js'

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export const normalizePersonality = (input: Partial<Personality>): Personality => ({
  courage: clamp01(input.courage ?? 0.5),
  caution: clamp01(input.caution ?? 0.5),
  attachment: clamp01(input.attachment ?? 0.5),
  altruism: clamp01(input.altruism ?? 0.5),
  greed: clamp01(input.greed ?? 0.2),
  curiosity: clamp01(input.curiosity ?? 0.45),
  loyalty: clamp01(input.loyalty ?? 0.5),
  denial: clamp01(input.denial ?? 0.15),
  composure: clamp01(input.composure ?? 0.5),
})

export const perceive = (character: NmnCharacter, event: WorldEvent): PerceivedEvent => {
  const samePlace = character.location === event.location
  const rumorKnown = character.knowledge.facts.some(fact => fact.domain === 'current-event' && fact.content.includes(event.kind))
  let awareness: PerceivedEvent['awareness'] = 'unknown'
  if (samePlace && event.evidence >= 0.55) awareness = 'witnessed'
  else if (samePlace) awareness = 'incomplete'
  else if (rumorKnown || event.rumorStrength >= 0.45) awareness = 'rumor'
  const medicalSkill = character.knowledge.skills.medicine ?? 0
  const combatSkill = character.knowledge.skills.combat ?? 0
  const denialMask = awareness === 'witnessed' ? character.personality.denial * 0.25 : character.personality.denial
  const danger = clamp01(event.danger * (awareness === 'unknown' ? 0.05 : awareness === 'rumor' ? 0.45 : 0.9) * (1 - denialMask * 0.7))
  const medicalNeed = medicalSkill >= 0.3 ? event.medicalNeed : event.medicalNeed * 0.15
  const combatNeed = combatSkill >= 0.3 ? event.combatNeed : event.combatNeed * 0.2
  const certainty = awareness === 'witnessed' ? clamp01(event.evidence) : awareness === 'rumor' ? clamp01(event.rumorStrength * 0.5) : 0.05
  return {
    eventId: event.id,
    awareness,
    danger,
    opportunity: awareness === 'unknown' ? 0 : event.opportunity,
    medicalNeed,
    combatNeed,
    evidence: awareness === 'unknown' ? 0 : event.evidence,
    certainty,
    description: awareness === 'unknown' ? 'Nenhuma evidência direta deste evento.' : event.description,
    misinterpreted: awareness === 'rumor' || (awareness === 'incomplete' && medicalSkill < 0.3 && event.medicalNeed > 0.5),
  }
}

export const remember = (character: NmnCharacter, content: string, impact: number): MemoryItem => {
  const item: MemoryItem = {
    id: `mem-${character.tick}-${character.memory.length}`,
    layer: impact >= 0.7 ? 'important' : 'recent',
    content,
    impact: clamp01(impact),
    createdAtTick: character.tick,
  }
  character.memory.push(item)
  const recent = character.memory.filter(entry => entry.layer === 'recent')
  if (recent.length > 16) {
    const oldest = recent[0]
    oldest.layer = 'consolidated'
    oldest.content = `resumo: ${oldest.content.slice(0, 80)}`
  }
  const important = character.memory.filter(entry => entry.layer === 'important')
  if (important.length > 24) important[0].layer = 'historical'
  const active = character.memory.filter(entry => entry.layer === 'active')
  if (active.length > 8) active[0].layer = 'recent'
  character.memory = character.memory.filter(entry => entry.layer !== 'historical' || character.fidelity === 'full')
  return item
}

export const addFact = (character: NmnCharacter, fact: Omit<KnowledgeFact, 'id'> & { id?: string }) => {
  const next: KnowledgeFact = { id: fact.id ?? `fact-${character.knowledge.facts.length + 1}`, ...fact }
  const existing = character.knowledge.facts.find(item => item.content === next.content)
  if (existing) {
    existing.confidence = Math.max(existing.confidence, next.confidence)
    return existing
  }
  character.knowledge.facts.push(next)
  return next
}

export const familyState = (character: NmnCharacter) => {
  const family = character.relationships.filter(item => item.kind === 'family')
  return {
    nearby: family.some(item => item.proximity === 'near' && item.status === 'present'),
    missing: family.some(item => item.status === 'missing'),
    far: family.some(item => item.proximity === 'far' || item.status === 'distant'),
  }
}

export const loadForFidelity = (character: NmnCharacter) => {
  if (character.fidelity === 'dormant') {
    return { ...character, memory: character.memory.filter(item => item.layer === 'important').slice(0, 4), knowledge: { ...character.knowledge, facts: character.knowledge.facts.slice(0, 2) } }
  }
  if (character.fidelity === 'low') {
    return { ...character, memory: character.memory.filter(item => item.layer === 'important' || item.layer === 'active').slice(0, 8) }
  }
  if (character.fidelity === 'medium') {
    return { ...character, memory: character.memory.filter(item => item.layer !== 'historical').slice(0, 16) }
  }
  return character
}
