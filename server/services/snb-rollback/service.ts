import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { SnbRollbackCore } from './core.js'

export class SnbRollbackService {
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  evaluate(userId: string, candidateId: string) {
    return new SnbRollbackCore(this.store).evaluate(userId, candidateId)
  }

  async record(userId: string, input: { projectId: string; name: string; candidateId: string }) {
    const payload = this.evaluate(userId, input.candidateId)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rollback.json',
      mime: 'application/vnd.snb.rollback+json',
      type: 'analysis.snb-rollback',
      producer: 'snb.rollback',
      metadata: { action: payload.decision.action, puterInvoked: false, restoredId: payload.restoredId ?? null },
    })
  }
}
