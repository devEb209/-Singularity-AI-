import type { ArtifactRecord } from '../../domain.js'
import { compareMetrics, keysOf } from './metrics.js'
import type { RollbackDecision } from './types.js'

export const decideRollback = (baseline: ArtifactRecord, candidate: ArtifactRecord): RollbackDecision => {
  const metrics = compareMetrics(baseline, candidate)
  const keysLost = keysOf(baseline.metadata).filter(key => !(key in candidate.metadata))
  const validityLost = baseline.verification.valid === true && candidate.verification.valid !== true
  const metricHit = metrics.some(item => item.regresses)
  if (validityLost || metricHit || keysLost.length > 0) {
    return {
      action: 'rollback',
      reason: validityLost ? 'candidate-lost-verification' : metricHit ? 'numeric-quality-regression' : 'required-metadata-lost',
      metrics,
      keysLost,
      validityLost,
    }
  }
  return { action: 'accept', reason: 'no-measured-regression', metrics, keysLost, validityLost }
}
