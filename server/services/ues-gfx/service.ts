import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesGfxCore } from './core.js'

export class UesGfxService {
  private core = new UesGfxCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'gfx.json',
      mime: 'application/vnd.snb.ues-gfx+json',
      type: 'runtime.ues-gfx',
      producer: 'ues.gfx',
      metadata: { drawn: payload.frame.drawn, vulkanRequired: false },
    })
  }
}
