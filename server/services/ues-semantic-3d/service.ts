import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesSemantic3dCore } from './core.js'

export class UesSemantic3dService {
  private core = new UesSemantic3dCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'objeto arbitrario')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'semantic-3d.json',
      mime: 'application/vnd.snb.ues-semantic-3d+json',
      type: 'production.ues-semantic-3d',
      producer: 'ues.semantic-3d',
      metadata: { kind: payload.semantic.identity.kind, catalogBound: false, specialistDerived: false },
    })
  }
}
