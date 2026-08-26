import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesGpuCore } from './core.js'

export class UesGpuService {
  private core = new UesGpuCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'gpu.json',
      mime: 'application/vnd.snb.ues-gpu+json',
      type: 'runtime.ues-gpu',
      producer: 'ues.gpu',
      metadata: { webgpuRequired: false, ownsLowLevelApi: false, drawn: payload.frame.drawn },
    })
  }
}
