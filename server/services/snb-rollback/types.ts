export interface MetricPoint {
  key: string
  baseline: number
  candidate: number
  delta: number
  regresses: boolean
}

export interface RollbackDecision {
  action: 'accept' | 'rollback'
  reason: string
  metrics: MetricPoint[]
  keysLost: string[]
  validityLost: boolean
}

export interface RollbackResult {
  format: 'snb-artifact-rollback-v1'
  decision: RollbackDecision
  candidateId: string
  restoredId?: string
  candidateStatus: string
  restoredStatus?: string
  puterInvoked: false
  verification: { valid: boolean; automaticPuter: false }
}
