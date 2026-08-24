import { resolve } from 'node:path'
import type { ArtifactGraphService } from '../artifact-graph.js'
import type { Store } from '../../repositories/store.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesScaleCore } from './core.js'

export class UesScaleService {
  private core = new UesScaleCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process(input.name)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'scale.json',
      mime: 'application/vnd.snb.ues-scale+json',
      type: 'runtime.ues-scale',
      producer: 'ues.scale',
      metadata: { rungs: payload.rungs.length, loadedWholePlanet: false },
    })
  }
}
