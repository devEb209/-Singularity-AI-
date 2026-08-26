import { DThesisCore } from '../d-thesis/core.js'
import { runContinuity } from '../rrw/continuity.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwContinueCore {
  private thesis = new DThesisCore()

  process(prompt = '2 dias de oceano salgado com fogo, floresta, um humano e um abrigo') {
    const continuity = runContinuity(prompt)
    const kernel = runKernel('Continuar a realidade retida: dias, consulta, envelope e D-O15', 'rrw.continue', ['rrw', 'session'], [
      { module: 'knowledge', accepted: continuity.query.foundShelter && continuity.query.hasWater, note: 'query held graph' },
      { module: 'd-thesis', accepted: continuity.verification.instantAaa === false, note: 'time from description' },
      { module: 'genesis', accepted: continuity.verification.valid && !continuity.verification.genesisClosed, note: 'continues, not closed' },
      { module: 'represent', accepted: continuity.days.shelter && !continuity.presented.meshIsFoundation, note: 'shelter is a node' },
      { module: 'd-o15', accepted: continuity.presented.sameIds && continuity.presented.weakerDescribesLess, note: 'same ids' },
      { module: 'execute', accepted: continuity.continued.resumed && continuity.continued.shelterSurvived && continuity.food.conserved, note: 'reload + days' },
      { module: 'verify', accepted: !continuity.verification.traditionalPipeline && continuity.sound.waterFaster, note: 'not a renamed engine' },
      { module: 'refine', accepted: continuity.refined.settled && !continuity.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Continuar e consultar a realidade RRW sem copiar savegame de engine',
      constraints: ['sem consciência', 'sem mesh store', 'sem fechar Gênesis no papel'],
      resources: ['envelope', 'query', 'days', 'D-O15'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 10 },
    })
    return {
      ...continuity,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...continuity.verification,
        valid: kernel.verification.valid && continuity.verification.valid,
      },
    }
  }
}
