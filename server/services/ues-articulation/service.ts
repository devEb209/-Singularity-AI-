import { resolve } from 'node:path'
import type { ArtifactGraphService } from '../artifact-graph.js'
import type { Store } from '../../repositories/store.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesArticulationCore } from './core.js'

export class UesArticulationService {
  private core = new UesArticulationCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async simulate(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'articulation.json',
      mime: 'application/vnd.snb.ues-articulation+json',
      type: 'simulation.ues-articulation',
      producer: 'ues.articulation',
      metadata: { featherstone: false, reached: payload.reachable.reached },
    })
  }
}
