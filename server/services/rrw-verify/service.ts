import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { RrwVerifyCore } from './core.js'

export class RrwVerifyService {
  private core = new RrwVerifyCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-verify.json',
      mime: 'application/vnd.snb.rrw-verify+json',
      type: 'analysis.rrw-verify',
      producer: 'rrw.verify',
      metadata: { inferenceIsFact: false, meshStore: false, completeReality: false },
    })
  }
}
