import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { SnbToolboxCore } from './core.js'

export class SnbToolboxService {
  private core = new SnbToolboxCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'toolbox.json',
      mime: 'application/vnd.snb.toolbox+json',
      type: 'catalog.snb-toolbox',
      producer: 'snb.toolbox',
      metadata: { assets: payload.assets, marketplaceLive: false },
    })
  }
}
