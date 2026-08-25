import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { bindNmnToWorld } from './bind.js'

export class UesNmnWorldCore {
  private thesis = new DThesisCore()

  process(projectId = 'world') {
    const bound = bindNmnToWorld(projectId)
    const kernel = runKernel('Integrar NMN ao mundo sem reação única de script', 'ues.nmn-world', ['nmn', 'represent'], [
      { module: 'knowledge', accepted: true, note: 'world event' },
      { module: 'd-thesis', accepted: true, note: 'contextual agents' },
      { module: 'nmn', accepted: bound.verification.valid, note: 'distinct actions' },
      { module: 'represent', accepted: true, note: 'npc lod' },
      { module: 'd-o15', accepted: true, note: 'dormant far agents' },
      { module: 'execute', accepted: true, note: 'two ticks' },
      { module: 'verify', accepted: !bound.verification.scriptedGlobalReaction, note: 'no global script' },
      { module: 'refine', accepted: true, note: 'no consciousness claim' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'NPCs decidem pelo estado, não por um único script de invasão',
      constraints: ['sem consciência', 'sem onisciência'],
      resources: ['NMN', 'world event', 'D-O15'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      ...bound,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { ...bound.verification, valid: bound.verification.valid && kernel.verification.valid },
    }
  }
}
