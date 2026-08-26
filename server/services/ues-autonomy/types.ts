export type IntentionLevel = 1 | 2 | 3 | 4 | 5
export type AutonomyStage =
  | 'intention'
  | 'planning'
  | 'research'
  | 'specialization'
  | 'implementation'
  | 'test'
  | 'verification'
  | 'correction'
  | 'integration'
  | 'do15'
  | 'evaluation'
  | 'complete'
  | 'paused'
  | 'blocked'
  | 'awaiting-user'
export type HumanControl =
  | 'pause'
  | 'continue'
  | 'alter'
  | 'reject'
  | 'approve'
  | 'review'
  | 'take-control'
  | 'return-autonomy'
export type KnowledgeClass =
  | 'established'
  | 'strong-evidence'
  | 'moderate-evidence'
  | 'uncertain'
  | 'hypothesis'
  | 'speculation'

export const DECISION_WINDOW_MS = 330_000

export interface IntentionItem {
  id: string
  level: IntentionLevel
  text: string
  mutable: boolean
}

export interface KnowledgeItem {
  id: string
  claim: string
  classification: KnowledgeClass
  sourceCount: number
  independentSources: number
  tested: boolean
  usableAsFact: boolean
  reason: string
}

export interface DecisionWindow {
  id: string
  question: string
  alternatives: string[]
  recommended: string
  delegated: boolean
  openedAt: string
  expiresAt: string
  status: 'open' | 'answered' | 'expired-applied' | 'expired-blocked'
  answer?: string
}

export interface AutonomyProject {
  id: string
  userId: string
  projectId: string
  name: string
  intent: string
  items: IntentionItem[]
  stage: AutonomyStage
  remaining: string[]
  cycle: number
  paused: boolean
  humanInControl: boolean
  window: DecisionWindow | null
  knowledge: KnowledgeItem[]
  history: { at: string; stage: AutonomyStage; note: string }[]
  isolation: { projectScoped: true; usedForGlobalTraining: false; tenant: string }
  members: { userId: string; role: 'owner' | 'member' }[]
  createdAt: string
  updatedAt: string
}
