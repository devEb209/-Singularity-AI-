import { resolve } from 'node:path'
import type { ArtifactGraphService } from '../artifact-graph.js'
import type { Store } from '../../repositories/store.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesExplorerCore } from './core.js'

export class UesExplorerService {
  private core = new UesExplorerCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async apply(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'explorer.json',
      mime: 'application/vnd.snb.ues-explorer+json',
      type: 'runtime.ues-explorer',
      producer: 'ues.explorer',
      metadata: { model: payload.selection.model, card: payload.selection.card, vision: false },
    })
  }
}
