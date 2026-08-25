import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesAtelierCore } from './core.js'

export class UesAtelierService {
  private core = new UesAtelierCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'ponte de pedra habitada e bloco recortado')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'atelier.json',
      mime: 'application/vnd.snb.ues-atelier+json',
      type: 'production.ues-atelier',
      producer: 'ues.atelier',
      metadata: { imageTo3d: false, physx: false, recast: false, automaticPuter: false, instantAaa: false, gpp: payload.dThesis.gpp },
    })
  }
}
