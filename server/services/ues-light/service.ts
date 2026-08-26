import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesLightCore } from './core.js'

export class UesLightService {
  private core = new UesLightCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'light.json',
      mime: 'application/vnd.snb.ues-light+json',
      type: 'runtime.ues-light',
      producer: 'ues.light',
      metadata: { lumen: false, pathTraced: false, lights: payload.lights },
    })
  }
}
