import { resolve } from 'node:path'
import type { ArtifactGraphService } from '../artifact-graph.js'
import type { Store } from '../../repositories/store.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesTerrainNavCore } from './core.js'

export class UesTerrainNavService {
  private core = new UesTerrainNavCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; seed?: string }) {
    const payload = this.core.process(input.seed ?? 'earth-like')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'terrain-nav.json',
      mime: 'application/vnd.snb.ues-terrain-nav+json',
      type: 'runtime.ues-terrain-nav',
      producer: 'ues.terrain-nav',
      metadata: { found: payload.path.found, recast: false },
    })
  }
}
