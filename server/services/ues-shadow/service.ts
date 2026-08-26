import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesShadowCore } from './core.js'

export class UesShadowService {
  private core = new UesShadowCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'shadow.json',
      mime: 'application/vnd.snb.ues-shadow+json',
      type: 'runtime.ues-shadow',
      producer: 'ues.shadow',
      metadata: { size: payload.size, virtualShadowMaps: false },
    })
  }
}
