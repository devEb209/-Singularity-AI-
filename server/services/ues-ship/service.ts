import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesShipCore } from './core.js'

export class UesShipService {
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async evaluate(userId: string, input: { projectId: string; name: string }) {
    const payload = new UesShipCore(this.store).evaluate(userId, input.projectId)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'ship.json',
      mime: 'application/vnd.snb.ues-ship+json',
      type: 'analysis.ues-ship',
      producer: 'ues.ship',
      metadata: { ready: payload.ready, instantAaa: false },
    })
  }
}
