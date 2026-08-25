import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { SnbCollabCore } from './core.js'

export class SnbCollabService {
  private core = new SnbCollabCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'collab.json',
      mime: 'application/vnd.snb.collab+json',
      type: 'runtime.snb-collab',
      producer: 'snb.collab',
      metadata: { livePresence: false, shares: payload.shares },
    })
  }
}
