import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { RrwPresentCore } from './core.js'

export class RrwPresentService {
  private core = new RrwPresentCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? input.name)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-present.json',
      mime: 'application/vnd.snb.rrw-present+json',
      type: 'runtime.rrw-present',
      producer: 'rrw.present',
      metadata: { framebufferFoundation: false, meshIsFoundation: false },
    })
  }
}
