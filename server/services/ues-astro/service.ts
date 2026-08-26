import { resolve } from 'node:path'
import type { ArtifactGraphService } from '../artifact-graph.js'
import type { Store } from '../../repositories/store.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesAstroCore } from './core.js'

export class UesAstroService {
  private core = new UesAstroCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'astro.json',
      mime: 'application/vnd.snb.ues-astro+json',
      type: 'analysis.ues-astro',
      producer: 'ues.astro',
      metadata: { planets: payload.catalog.planets, nBody: false, nasa: false },
    })
  }
}
