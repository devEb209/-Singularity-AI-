import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { RrwSenseCore } from './core.js'

export class RrwSenseService {
  private core = new RrwSenseCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-sense.json',
      mime: 'application/vnd.snb.rrw-sense+json',
      type: 'production.rrw-sense',
      producer: 'ues.rrw-sense',
      metadata: { completeReality: false, genesisClosed: false, prompt: input.prompt ?? '' },
    })
  }
}
