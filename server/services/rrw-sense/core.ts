import { DThesisCore } from '../d-thesis/core.js'
import { runSense } from '../rrw/sense-run.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwSenseCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const sense = runSense(prompt)
    const kernel = runKernel('Aprofundar sentidos RRW como conhecimento, sem fingir qualia', 'rrw.sense', ['rrw', 'represent'], [
      { module: 'knowledge', accepted: sense.smell.detected && sense.studio.kept, note: 'scent and edit are claims' },
      { module: 'd-thesis', accepted: !sense.verification.consciousnessClaim, note: 'no qualia claim' },
      { module: 'genesis', accepted: sense.verification.valid && !sense.verification.genesisClosed, note: 'deeper, not closed' },
      { module: 'represent', accepted: sense.touch.grasped && !sense.verification.meshIsFoundation, note: 'touch is contact' },
      { module: 'd-o15', accepted: !sense.studio.aaaEditor, note: 'studio is not a preset viewport' },
      { module: 'execute', accepted: sense.trail.followed && sense.pain.signal, note: 'trail and nociception execute' },
      { module: 'verify', accepted: !sense.verification.traditionalPipeline && !sense.verification.shaderSmell, note: 'not a renamed engine' },
      { module: 'refine', accepted: sense.studio.kept && !sense.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Representar sentidos e edição RRW sem copiar engine de jogo nem afirmar consciência',
      constraints: ['sem qualia', 'sem AAA editor', 'sem fechar Gênesis no papel'],
      resources: ['smell', 'taste', 'touch', 'edit-claim'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...sense,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: { ...sense.verification, valid: kernel.verification.valid && sense.verification.valid },
    }
  }
}
