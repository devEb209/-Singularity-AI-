import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesTextureCore } from './core.js'

export class UesTextureService {
  private core = new UesTextureCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'texture.json',
      mime: 'application/vnd.snb.ues-texture+json',
      type: 'runtime.ues-texture',
      producer: 'ues.texture',
      metadata: { mips: payload.mips, storedBitmap16k: false },
    })
  }
}
