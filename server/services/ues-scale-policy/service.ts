import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesScalePolicyCore } from './core.js'

export class UesScalePolicyService {
  private core = new UesScalePolicyCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'scale-policy.json',
      mime: 'application/vnd.snb.ues-scale-policy+json',
      type: 'analysis.ues-scale-policy',
      producer: 'ues.scale-policy',
      metadata: { fixedCap: false, requested: payload.requested },
    })
  }
}
