import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { SnbCanonCore } from './core.js'

export class SnbCanonService {
  private core = new SnbCanonCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'canon.json',
      mime: 'application/vnd.snb.canon+json',
      type: 'runtime.snb-canon',
      producer: 'snb.canon',
      metadata: { marketplaceLive: false, universes: payload.after.length },
    })
  }
}
