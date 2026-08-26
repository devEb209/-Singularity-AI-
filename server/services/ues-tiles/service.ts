import { resolve } from 'node:path'
import type { ArtifactGraphService } from '../artifact-graph.js'
import type { Store } from '../../repositories/store.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesTilesCore } from './core.js'

export class UesTilesService {
  private core = new UesTilesCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'tiles.json',
      mime: 'application/vnd.snb.ues-tiles+json',
      type: 'runtime.ues-tiles',
      producer: 'ues.tiles',
      metadata: { selected: payload.tree.selected, cesium: false, liveDataset: false },
    })
  }
}
