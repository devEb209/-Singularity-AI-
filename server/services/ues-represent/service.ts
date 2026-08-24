import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesRepresentCore } from './core.js'
import type { HardwareTier } from './types.js'

export class UesRepresentService {
  private core = new UesRepresentCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; hardware?: HardwareTier }) {
    const payload = this.core.process(input.hardware ?? 'balanced')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'represent.json',
      mime: 'application/vnd.snb.ues-represent+json',
      type: 'analysis.ues-represent',
      producer: 'ues.represent',
      metadata: { tier: payload.tier, objectOnly: false, drawn: payload.summary.drawn },
    })
  }
}
