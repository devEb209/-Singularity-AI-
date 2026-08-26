import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesCloseCore } from './core.js'

export class UesCloseService {
  private core = new UesCloseCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'ponte de pedra e FN FAL recarregando')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'close.json',
      mime: 'application/vnd.snb.ues-close+json',
      type: 'production.ues-close',
      producer: 'ues.close',
      metadata: { catalogBound: false, vulkanRequired: false, vision: false, instantAaa: false, gpp: payload.dThesis.gpp },
    })
  }
}
