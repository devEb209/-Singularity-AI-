import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { SnbConsensusCore } from './core.js'

export class SnbConsensusService {
  private core = new SnbConsensusCore()
  constructor(
    private store: Store,
    private artifacts: ArtifactGraphService,
    private secret: string,
    private root = resolve('./data/uploads'),
  ) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process(this.secret, `${input.projectId}:${input.name}`)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'consensus.json',
      mime: 'application/vnd.snb.consensus+json',
      type: 'analysis.snb-consensus',
      producer: 'snb.consensus',
      metadata: { decision: payload.decision, automaticPuter: false, providerAttested: false },
    })
  }
}
