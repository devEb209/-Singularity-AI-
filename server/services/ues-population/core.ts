import { DThesisCore } from '../d-thesis/core.js'
import { seedPopulation } from '../ues-lives/society.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { compactCells, planPopulation, reconstructNear } from './scale.js'

export class UesPopulationCore {
  private thesis = new DThesisCore()

  process(seed = 'genesis-pop') {
    const bands = planPopulation(1_000_000, 64)
    const cells = compactCells(bands.find(item => item.cognition === 'statistical')?.agents ?? 0)
    const near = seedPopulation(seed, 320, 64)
    const kernel = runKernel('Escalar população por cognição, não por milhões de mentes', 'ues.population', ['lives', 'represent'], [
      { module: 'knowledge', accepted: true, note: 'hierarchical cognition' },
      { module: 'd-thesis', accepted: true, note: 'far is statistical' },
      { module: 'population', accepted: bands.reduce((sum, item) => sum + item.agents, 0) === 1_000_000, note: 'one million compact' },
      { module: 'represent', accepted: reconstructNear(bands) === 320, note: 'unique near only' },
      { module: 'd-o15', accepted: cells.reduce((sum, item) => sum + item.count, 0) === (bands.find(item => item.cognition === 'statistical')?.agents ?? -1), note: 'cell counts' },
      { module: 'execute', accepted: near.people.filter(item => item.fidelity === 'full').length === 64, note: 'lives near' },
      { module: 'verify', accepted: !bands.find(item => item.cognition === 'statistical')?.uniqueMinds, note: 'no fake minds' },
      { module: 'refine', accepted: true, note: 'Recast still absent' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Milhões como população estatística reconstruível, não como 1e6 NMN únicos',
      constraints: ['sem consciência', 'sem fingir mente completa longe'],
      resources: ['lives', 'D-O15'],
      priorities: { quality: 7, performance: 9, safety: 8, cost: 4, scalability: 10 },
    })
    return {
      format: 'ues-population-v1',
      bands,
      cells: cells.length,
      statistical: cells.reduce((sum, item) => sum + item.count, 0),
      uniqueNear: reconstructNear(bands),
      sampleFull: near.people.filter(item => item.fidelity === 'full').length,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && bands.reduce((sum, item) => sum + item.agents, 0) === 1_000_000,
        uniqueMillionMinds: false,
        consciousnessClaim: false,
      },
      limitations: ['Statistical million + 320 unique near', 'Not a million unique NMN minds'],
    }
  }
}
