import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { catalogSnapshot } from '../rrw/catalog.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { RrwPhenomenaCore } from './core.js'

export class RrwPhenomenaService {
  private core = new RrwPhenomenaCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  catalog() {
    return catalogSnapshot()
  }

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt)
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'rrw-phenomena.json',
      mime: 'application/vnd.snb.rrw-phenomena+json',
      type: 'production.rrw-phenomena',
      producer: 'ues.rrw-phenomena',
      metadata: {
        traditionalPipeline: false,
        completeReality: false,
        openCatalog: payload.catalog.open,
        prompt: input.prompt ?? '',
      },
    })
  }
}
