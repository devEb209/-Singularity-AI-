import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { RrwCore } from './core.js'

export class RrwService {
  private core = new RrwCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw.json',
      mime: 'application/vnd.snb.rrw+json',
      type: 'production.rrw',
      producer: 'ues.rrw',
      metadata: {
        traditionalPipeline: false,
        meshIsFoundation: false,
        pbrIsFoundation: false,
        completeReality: false,
        prompt: input.prompt ?? '',
      },
    })
  }
}
