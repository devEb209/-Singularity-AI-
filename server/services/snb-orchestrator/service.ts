import { resolve } from 'node:path'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { persistUesArtifact } from '../ues-shared/persist.js'
import { SnbOrchestratorCore } from './core.js'

export class SnbOrchestratorService {
  private core = new SnbOrchestratorCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    const payload = this.core.process(input.prompt ?? 'ponte de pedra e recorte esferico')
    return persistUesArtifact(this.store, this.artifacts, this.root, userId, input, payload, {
      suffix: 'orchestrator.json',
      mime: 'application/vnd.snb.orchestrator+json',
      type: 'analysis.snb-orchestrator',
      producer: 'snb.orchestrator',
      metadata: { automaticInternal: true, automaticPuter: false, tickets: payload.tickets.length },
    })
  }
}
