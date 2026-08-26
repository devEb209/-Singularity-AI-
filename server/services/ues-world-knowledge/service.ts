import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesWorldKnowledgeCore } from './core.js'

export class UesWorldKnowledgeService {
  private core = new UesWorldKnowledgeCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; seed?: string }) {
    const payload = this.core.process(/alien|ficc|fantasia/.test(input.seed ?? input.name) ? 'alien' : 'earth')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'world-knowledge.json',
      mime: 'application/vnd.snb.ues-world-knowledge+json',
      type: 'world.ues-knowledge',
      producer: 'ues.world-knowledge',
      metadata: { nasaRequired: false, earthIsLimit: false, mode: payload.mode },
    })
  }
}
