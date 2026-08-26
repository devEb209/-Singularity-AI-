import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { realityLayers } from './catalog.js'
import { transversalSystems } from './transversal.js'
import { RrwLayersCore } from './core.js'

export class RrwLayersService {
  private core = new RrwLayersCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  catalog() {
    return {
      format: 'rrw-layers-catalog-v1' as const,
      layers: realityLayers,
      transversal: transversalSystems,
      do15MayDeleteLayer: false as const,
      completeReality: false as const,
      genesisClosed: false as const,
    }
  }

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-layers.json',
      mime: 'application/vnd.snb.rrw-layers+json',
      type: 'production.rrw-layers',
      producer: 'ues.rrw-layers',
      metadata: { completeReality: false, genesisClosed: false, prompt: input.prompt ?? '', layers: 30 },
    })
  }
}
