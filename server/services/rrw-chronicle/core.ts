import { DThesisCore } from '../d-thesis/core.js'
import { runChronicle } from '../rrw/chronicle-run.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwChronicleCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const chronicle = runChronicle(prompt)
    const kernel = runKernel('Crônica RRW: lembrar o que aconteceu no grafo e ligar necessidades à realidade', 'rrw.chronicle', ['rrw', 'session'], [
      { module: 'knowledge', accepted: chronicle.session.fireRemembered && chronicle.session.forageRemembered, note: 'events are claims' },
      { module: 'd-thesis', accepted: !chronicle.verification.uniqueFullMinds, note: 'no consciousness' },
      { module: 'genesis', accepted: chronicle.verification.valid && !chronicle.verification.genesisClosed, note: 'remembers, not closed' },
      { module: 'represent', accepted: chronicle.session.shelterSurvived && !chronicle.verification.meshLog, note: 'chronicle is not a mesh log' },
      { module: 'd-o15', accepted: chronicle.session.sameIds, note: 'same ids after reload' },
      { module: 'execute', accepted: chronicle.reactions.coldSeeksShelter && chronicle.reactions.drySeeksWater && chronicle.reactions.hungryForages, note: 'needs from moles' },
      { module: 'verify', accepted: !chronicle.verification.traditionalPipeline && chronicle.session.forageConserved, note: 'not a renamed engine' },
      { module: 'refine', accepted: chronicle.session.chronicleKept && !chronicle.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Lembrar e ligar a sociedade à realidade RRW sem copiar quest log de jogo',
      constraints: ['sem consciência', 'sem apagar crônica', 'sem fechar Gênesis no papel'],
      resources: ['chronicle', 'needs', 'envelope'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...chronicle,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...chronicle.verification,
        valid: kernel.verification.valid && chronicle.verification.valid,
      },
    }
  }
}
