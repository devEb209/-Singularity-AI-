import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { RrwStudioCore } from './core.js'

export class RrwStudioService {
  private core = new RrwStudioCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-studio.json',
      mime: 'application/vnd.snb.rrw-studio+json',
      type: 'runtime.rrw-studio',
      producer: 'rrw.studio',
      metadata: { aaaEditor: false, meshViewport: false },
    })
  }
}
