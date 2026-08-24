import { createHmac } from 'node:crypto'
import { DThesisCore } from '../d-thesis/core.js'
import type { Store } from '../../repositories/store.js'
import { decideRollback } from './decide.js'
import { applyDecision, previousVerified } from './restore.js'
import type { RollbackResult } from './types.js'

export class SnbRollbackCore {
  private thesis = new DThesisCore()
  constructor(private store: Store, private secret = 'snb-rollback') {}

  evaluate(userId: string, candidateId: string): RollbackResult {
    const candidate = this.store.getArtifact(candidateId, userId)
    const baseline = previousVerified(this.store, userId, candidate)
    if (!baseline) {
      return {
        format: 'snb-artifact-rollback-v1',
        decision: { action: 'accept', reason: 'no-baseline-to-compare', metrics: [], keysLost: [], validityLost: false },
        candidateId: candidate.id,
        candidateStatus: candidate.status,
        puterInvoked: false,
        verification: { valid: true, automaticPuter: false },
      }
    }
    const decision = decideRollback(baseline, candidate)
    const applied = applyDecision(this.store, userId, candidate, decision.action)
    const dThesis = this.thesis.evaluate({
      objective: 'Aceitar ou reverter artifact por métrica, sem invocar Puter automaticamente',
      constraints: ['não fingir execução de especialista', 'rollback só com baseline verificada'],
      resources: ['artifact-graph', 'numeric metadata'],
      priorities: { quality: 9, performance: 7, safety: 10, cost: 4, scalability: 8 },
    })
    const payload = {
      format: 'snb-artifact-rollback-v1' as const,
      decision,
      candidateId: applied.candidate.id,
      restoredId: applied.restored?.id,
      candidateStatus: applied.candidate.status,
      restoredStatus: applied.restored?.status,
      puterInvoked: false as const,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      receipt: `snb-rollback-hmac:${createHmac('sha256', this.secret).update(`${candidate.id}:${decision.action}`).digest('hex')}`,
      verification: { valid: decision.action === 'accept' ? candidate.verification.valid === true : applied.candidate.status === 'rejected', automaticPuter: false as const },
    }
    return payload
  }
}
