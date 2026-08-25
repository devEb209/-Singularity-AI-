import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesLivesCore } from './core.js'

export class UesLivesService {
  private core = new UesLivesCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async simulate(userId: string, input: { projectId: string; name: string; seed?: string }) {
    const payload = this.core.process(input.seed ?? input.name)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'lives.json',
      mime: 'application/vnd.snb.ues-lives+json',
      type: 'simulation.ues-lives',
      producer: 'ues.lives',
      metadata: { population: payload.population, millions: false, consciousnessClaim: false },
    })
  }
}
