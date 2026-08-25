import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesShaderCore } from './core.js'

export class UesShaderService {
  private core = new UesShaderCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'shader.json',
      mime: 'application/vnd.snb.ues-shader+json',
      type: 'runtime.ues-shader',
      producer: 'ues.shader',
      metadata: { optimized: payload.optimized, spirvRequired: false },
    })
  }
}
