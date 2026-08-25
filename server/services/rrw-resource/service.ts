import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { RrwResourceCore } from './core.js'

export class RrwResourceService {
  private core = new RrwResourceCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-resource.json',
      mime: 'application/vnd.snb.rrw-resource+json',
      type: 'runtime.rrw-resource',
      producer: 'rrw.resource',
      metadata: { dedicatedGpuRequired: false },
    })
  }
}
