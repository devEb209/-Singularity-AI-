import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesPopulationCore } from './core.js'

export class UesPopulationService {
  private core = new UesPopulationCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async simulate(userId: string, input: { projectId: string; name: string; seed?: string }) {
    const payload = this.core.process(input.seed ?? input.name)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'population.json',
      mime: 'application/vnd.snb.ues-population+json',
      type: 'simulation.ues-population',
      producer: 'ues.population',
      metadata: { uniqueMillionMinds: false, statistical: payload.statistical },
    })
  }
}
