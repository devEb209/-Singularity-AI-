import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesSolidCore } from './core.js'

export class UesSolidService {
  private core = new UesSolidCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'bloco com recorte esferico')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'solid.json',
      mime: 'application/vnd.snb.ues-solid+json',
      type: 'production.ues-solid',
      producer: 'ues.solid',
      metadata: { imageTo3d: false, specialistDerived: false, subtractCells: payload.csg.subtract.cells },
    })
  }
}
