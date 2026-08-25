import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesPostCore } from './core.js'

export class UesPostService {
  private core = new UesPostCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'post.json',
      mime: 'application/vnd.snb.ues-post+json',
      type: 'runtime.ues-post',
      producer: 'ues.post',
      metadata: { dlss: false, tsr: false },
    })
  }
}
