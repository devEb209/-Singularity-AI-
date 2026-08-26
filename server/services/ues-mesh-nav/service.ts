import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesMeshNavCore } from './core.js'

export class UesMeshNavService {
  private core = new UesMeshNavCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'ponte de pedra com dois arcos')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'mesh-nav.json',
      mime: 'application/vnd.snb.ues-mesh-nav+json',
      type: 'runtime.ues-mesh-nav',
      producer: 'ues.mesh-nav',
      metadata: { recast: false, found: payload.fromPrompt.found },
    })
  }
}
