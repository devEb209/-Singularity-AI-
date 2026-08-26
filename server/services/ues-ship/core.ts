import { DThesisCore } from '../d-thesis/core.js'
import type { Store } from '../../repositories/store.js'
import { evaluateGates, shipReady } from './gates.js'

export class UesShipCore {
  private thesis = new DThesisCore()
  constructor(private store: Store) {}

  evaluate(userId: string, projectId: string) {
    this.store.getProject(projectId, userId)
    const artifacts = this.store.listArtifacts(userId, projectId)
    const gates = evaluateGates(artifacts)
    const ready = shipReady(gates)
    const dThesis = this.thesis.evaluate({
      objective: 'Decidir se um projeto UES pode embarcar como geração 1 sem mentir qualidade',
      constraints: ['somente artifacts verificados', 'não reivindicar AAA instantâneo', 'não reivindicar NASA/visão/16K'],
      resources: ['artifact-graph', 'quality gates'],
      priorities: { quality: 9, performance: 6, safety: 10, cost: 4, scalability: 7 },
    })
    return {
      format: 'ues-ship-v1',
      projectId,
      ready,
      instantAaa: false,
      gates,
      verified: artifacts.filter(item => item.status === 'verified').map(item => ({ id: item.id, type: item.type, version: item.version })),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: gates.length === 8 && ready === gates.every(item => item.pass), instantAaa: false },
    }
  }
}
