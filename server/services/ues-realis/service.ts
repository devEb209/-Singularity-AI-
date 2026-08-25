import { resolve } from 'node:path'
import type { ArtifactGraphService } from '../artifact-graph.js'
import type { Store } from '../../repositories/store.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesRealisCore } from './core.js'
import { realisLedger } from './status.js'

export class UesRealisService {
  private core = new UesRealisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  status() {
    return {
      format: 'ues-realis-status-v1',
      blockingV1: false,
      liveRemote: false,
      nasa: false,
      vision: false,
      storedBitmap16k: false,
      ledger: realisLedger,
      summary: Object.fromEntries(['IMPLEMENTADO', 'ADAPTER DISPONÍVEL', 'DEPENDÊNCIA EXTERNA', 'PLANEJADO', 'NÃO IMPLEMENTADO'].map(status => [status, realisLedger.filter(item => item.status === status).length])),
    }
  }

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'terra habitavel')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'realis.json',
      mime: 'application/vnd.snb.ues-realis+json',
      type: 'production.ues-realis',
      producer: 'ues.realis',
      metadata: { implemented: payload.implemented, nasa: false, vision: false, storedBitmap16k: false, gpp: payload.dThesis.gpp },
    })
  }
}
