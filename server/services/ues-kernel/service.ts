import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesKernelCore } from './core.js'

export class UesKernelService {
  private core = new UesKernelCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'kernel.json',
      mime: 'application/vnd.snb.ues-kernel+json',
      type: 'analysis.ues-kernel',
      producer: 'ues.kernel',
      metadata: { stages: payload.stages.length, shared: true },
    })
  }
}
