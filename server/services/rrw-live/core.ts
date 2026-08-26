import { DThesisCore } from '../d-thesis/core.js'
import { runLive } from '../rrw/live-run.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwLiveCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const live = runLive(prompt, 6)
    const kernel = runKernel('Viver um tique RRW único: clima, reação, crônica, refino e caminho', 'rrw.live', ['rrw', 'session'], [
      { module: 'knowledge', accepted: live.chronicleGrew, note: 'one chronicle per hour' },
      { module: 'd-thesis', accepted: !live.verification.uniqueFullMinds, note: 'no consciousness' },
      { module: 'genesis', accepted: live.verification.valid && !live.verification.genesisClosed, note: 'one world, not closed' },
      { module: 'represent', accepted: live.shelterSurvived && !live.verification.meshIsFoundation, note: 'shelter is a node' },
      { module: 'd-o15', accepted: live.presented.sameIds, note: 'same ids' },
      { module: 'execute', accepted: live.fireCooled && live.conservedWater && live.walked.found, note: 'coupled tick' },
      { module: 'verify', accepted: !live.verification.traditionalPipeline && live.settled, note: 'not a renamed engine' },
      { module: 'refine', accepted: live.settled && !live.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Unir o mundo RRW num tique só, sem copiar game loop de engine',
      constraints: ['sem consciência', 'sem Recast', 'sem fechar Gênesis no papel'],
      resources: ['live-hour', 'chronicle', 'walk-memory'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...live,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...live.verification,
        valid: kernel.verification.valid && live.verification.valid,
      },
    }
  }
}
