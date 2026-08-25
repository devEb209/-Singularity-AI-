import { resolve } from 'node:path'
import type { ArtifactGraphService } from '../artifact-graph.js'
import type { Store } from '../../repositories/store.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesGisCore } from './core.js'

export class UesGisService {
  private core = new UesGisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  catalog() {
    return { format: 'ues-gis-catalog-v1', sources: this.core.sources(), liveRemote: false, nasa: false }
  }

  async ingest(userId: string, input: { projectId: string; name: string; sourceId?: string }) {
    const payload = this.core.ingest(input.sourceId ?? 'internal-fixture')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'gis.json',
      mime: 'application/vnd.snb.ues-gis+json',
      type: 'analysis.ues-gis',
      producer: 'ues.gis',
      metadata: { sourceId: payload.sourceId, liveRemote: false, nasa: false },
    })
  }
}
