import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { RrwCivicCore } from './core.js'

export class RrwCivicService {
  private core = new RrwCivicCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-civic.json',
      mime: 'application/vnd.snb.rrw-civic+json',
      type: 'production.rrw-civic',
      producer: 'ues.rrw-civic',
      metadata: { completeReality: false, genesisClosed: false, prompt: input.prompt ?? '' },
    })
  }
}
