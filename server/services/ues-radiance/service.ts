import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesRadianceCore } from './core.js'

export class UesRadianceService {
  private core = new UesRadianceCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'radiance.json',
      mime: 'application/vnd.snb.ues-radiance+json',
      type: 'production.ues-radiance',
      producer: 'ues.radiance',
      metadata: {
        written: payload.frame.written,
        checksum: payload.checksum,
        beatsUnreal: false,
        hardwareGpu: payload.verification.hardwareGpu,
        prompt: input.prompt ?? '',
      },
    })
  }
}
