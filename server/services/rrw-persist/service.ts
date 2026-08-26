import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { worldIdOf } from '../rrw/world-id.js'
import { WorldStore } from '../rrw/world-store.js'
import { RrwPersistCore } from './core.js'

export class RrwPersistService {
  private core = new RrwPersistCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const prompt = input.prompt ?? 'oceano salgado com fogo, floresta, um humano e um abrigo'
    const worldId = worldIdOf(`${userId}:${input.projectId}:${prompt}`, 'persist')
    const payload = this.core.process(prompt, new WorldStore(resolve('./data/rrw-worlds')), worldId)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-persist.json',
      mime: 'application/vnd.snb.rrw-persist+json',
      type: 'production.rrw-persist',
      producer: 'ues.rrw-persist',
      metadata: {
        completeReality: false,
        genesisClosed: false,
        prompt,
        worldId,
      },
    })
  }
}
