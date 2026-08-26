import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesNmnWorldCore } from './core.js'

export class UesNmnWorldService {
  private core = new UesNmnWorldCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async simulate(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process(input.projectId)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'nmn-world.json',
      mime: 'application/vnd.snb.ues-nmn-world+json',
      type: 'simulation.ues-nmn-world',
      producer: 'ues.nmn-world',
      metadata: { actions: payload.distinctActions.length, consciousnessClaim: false },
    })
  }
}
