import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { noFixedCap, planScale, type ScaleNeed } from './policy.js'

export class UesScalePolicyCore {
  private thesis = new DThesisCore()

  process() {
    const crowd: ScaleNeed[] = Array.from({ length: 40 }, (_, index) => ({
      id: `n${index}`,
      domain: index % 3 === 0 ? 'npc' : index % 3 === 1 ? 'geometry' : 'particle',
      influence: index < 5 ? 0.9 : index < 15 ? 0.4 : 0.08,
      distance: index < 5 ? 1 : index < 15 ? 8 : 30,
      visible: index < 20,
      interactive: index < 5,
    }))
    const planned = planScale(crowd, { full: 4, reduced: 8 })
    const kinds = new Set(planned.map(item => item.kind))
    const kernel = runKernel('Escala = necessidade × representação × D-O15, não um teto conceitual', 'ues.scale-policy', ['represent'], [
      { module: 'knowledge', accepted: true, note: 'open quantity' },
      { module: 'd-thesis', accepted: true, note: 'far compact' },
      { module: 'scale', accepted: noFixedCap(crowd) === 40, note: 'count is input not law' },
      { module: 'represent', accepted: planned.filter(item => item.kind === 'full').length <= 4, note: 'budget' },
      { module: 'd-o15', accepted: planned.some(item => item.kind === 'dormant'), note: 'dormant overflow' },
      { module: 'execute', accepted: kinds.size >= 3, note: 'mixed fidelity' },
      { module: 'verify', accepted: planned.length === crowd.length, note: 'all accounted' },
      { module: 'refine', accepted: true, note: 'no 320/1e6 dogma' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Recusar tetos conceituais; D-O15 escolhe representação',
      constraints: ['não fingir milhões de mentes full'],
      resources: ['representation chooser'],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 4, scalability: 10 },
    })
    return {
      format: 'ues-scale-policy-v1',
      requested: crowd.length,
      full: planned.filter(item => item.kind === 'full').length,
      dormant: planned.filter(item => item.kind === 'dormant').length,
      kinds: [...kinds],
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && planned.filter(item => item.kind === 'full').length <= 4 && planned.length === 40,
        fixedCap: false,
      },
      limitations: ['Policy, not a population engine'],
    }
  }
}
