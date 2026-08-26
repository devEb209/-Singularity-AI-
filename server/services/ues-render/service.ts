import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesRenderCore } from './core.js'

export class UesRenderService {
  private core = new UesRenderCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'render.json',
      mime: 'application/vnd.snb.ues-render+json',
      type: 'runtime.ues-render',
      producer: 'ues.render',
      metadata: { passes: payload.order.length, gpuRequired: false },
    })
  }
}
