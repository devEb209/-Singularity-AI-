import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesStudioCore } from './core.js'

export class UesStudioService {
  private core = new UesStudioCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'studio.json',
      mime: 'application/vnd.snb.ues-studio+json',
      type: 'runtime.ues-studio',
      producer: 'ues.studio',
      metadata: { nodes: payload.nodes, aaaViewport: false, clientEngine: false },
    })
  }
}
