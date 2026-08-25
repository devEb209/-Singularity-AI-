import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { UesGenesisCore } from './core.js'

export class UesGenesisService {
  private core = new UesGenesisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'genese: mundo, gpu e ecossistema')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'genesis.json',
      mime: 'application/vnd.snb.ues-genesis+json',
      type: 'production.ues-genesis',
      producer: 'ues.genesis',
      metadata: { webgpuRequired: false, automaticPuter: false, googleRequired: false, instantAaa: false, gpp: payload.dThesis.gpp },
    })
  }
}
