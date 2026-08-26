import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesRasterCore } from './core.js'

export class UesRasterService {
  private core = new UesRasterCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string }) {
    const payload = this.core.process()
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'raster.json',
      mime: 'application/vnd.snb.ues-raster+json',
      type: 'runtime.ues-raster',
      producer: 'ues.raster',
      metadata: { written: payload.written, hardwareGpu: payload.verification.hardwareGpu, checksum: payload.checksum },
    })
  }
}
