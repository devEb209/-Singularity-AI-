export type NmnFidelity = 'dormant' | 'low' | 'medium' | 'high' | 'full'
export type NmnAction =
  | 'flee'
  | 'hide'
  | 'protect-family'
  | 'search-missing'
  | 'aid-wounded'
  | 'defend'
  | 'seek-info'
  | 'continue-routine'
  | 'loot'
  | 'freeze'
  | 'follow-crowd'
  | 'evacuate-with-family'
  | 'travel-to-family'
  | 'help-evacuation'
export type Awareness = 'unknown' | 'rumor' | 'incomplete' | 'witnessed'
export type Proximity = 'near' | 'medium' | 'far' | 'unknown'
export type RelationStatus = 'present' | 'missing' | 'distant' | 'lost'

export interface Personality {
  courage: number
  caution: number
  attachment: number
  altruism: number
  greed: number
  curiosity: number
  loyalty: number
  denial: number
  composure: number
}

export interface KnowledgeFact {
  id: string
  content: string
  confidence: number
  source: 'witnessed' | 'taught' | 'rumor' | 'profession' | 'inferred'
  domain: string
}

export interface Relationship {
  id: string
  target: string
  kind: 'family' | 'friend' | 'rival' | 'authority' | 'stranger' | 'community'
  strength: number
  trust: number
  proximity: Proximity
  status: RelationStatus
}

export interface MemoryItem {
  id: string
  layer: 'active' | 'recent' | 'important' | 'consolidated' | 'historical'
  content: string
  impact: number
  createdAtTick: number
}

export interface Goal {
  id: string
  description: string
  priority: number
  origin: 'identity' | 'event' | 'relationship' | 'need'
}

export interface CausalLink {
  from: string
  to: string
  relation: 'experience' | 'memory' | 'belief' | 'goal' | 'behavior' | 'event'
}

export interface WorldEvent {
  id: string
  kind: string
  location: string
  danger: number
  opportunity: number
  medicalNeed: number
  combatNeed: number
  evidence: number
  rumorStrength: number
  authorityPresence: number
  scarcity: number
  dissatisfaction: number
  description: string
}

export interface PerceivedEvent {
  eventId: string
  awareness: Awareness
  danger: number
  opportunity: number
  medicalNeed: number
  combatNeed: number
  evidence: number
  certainty: number
  description: string
  misinterpreted: boolean
}

export interface NmnCharacter {
  id: string
  projectId: string
  identity: { name: string; occupation: string; origin: string; ageBand: string }
  personality: Personality
  knowledge: { skills: Record<string, number>; facts: KnowledgeFact[] }
  relationships: Relationship[]
  needs: { safety: number; energy: number; social: number; belonging: number; resources: number }
  values: string[]
  goals: Goal[]
  location: string
  resources: { id: string; kind: string; amount: number }[]
  memory: MemoryItem[]
  history: { id: string; tick: number; kind: string; content: string }[]
  causal: CausalLink[]
  lastAction?: NmnAction
  lastReason?: string
  fidelity: NmnFidelity
  relevance: number
  seed: number
  tick: number
}

export interface SocialObservation {
  actorId: string
  action: NmnAction
}

export interface SimulateInput {
  characters: NmnCharacter[]
  event: WorldEvent
  observations?: SocialObservation[]
  ticks?: number
}
