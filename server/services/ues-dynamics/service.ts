import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesDynamicsCore } from './core.js'

export class UesDynamicsService {
  private core = new UesDynamicsCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async simulate(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'dynamics.json',
      mime: 'application/vnd.snb.ues-dynamics+json',
      type: 'runtime.ues-dynamics',
      producer: 'ues.dynamics',
      metadata: { featherstone: payload.featherstone.algorithm, physx: false, completeObbObb: false },
    })
  }
}
