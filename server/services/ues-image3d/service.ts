import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesImage3dCore } from './core.js'

export class UesImage3dService {
  private core = new UesImage3dCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'colina a partir de referencia de luminancia')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'image3d.json',
      mime: 'application/vnd.snb.ues-image3d+json',
      type: 'production.ues-image3d',
      producer: 'ues.image3d',
      metadata: { learnedVision: false, puterRequired: false, peak: payload.mesh.peak },
    })
  }
}
