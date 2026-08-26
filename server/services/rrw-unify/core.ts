import { DThesisCore } from '../d-thesis/core.js'
import { runUnify } from '../rrw/unify.js'
import { WorldStore } from '../rrw/world-store.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwUnifyCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const unify = runUnify(prompt, 3, new WorldStore())
    const kernel = runKernel('Unir persistência, parentesco, trabalho, troca, saúde e fala num mundo RRW só', 'rrw.unify', ['rrw', 'session'], [
      { module: 'knowledge', accepted: unify.speech.heard && !unify.speech.tts, note: 'speech is a claim' },
      { module: 'd-thesis', accepted: !unify.verification.uniqueFullMinds, note: 'no consciousness' },
      { module: 'genesis', accepted: unify.verification.valid && !unify.verification.genesisClosed, note: 'one world, not closed' },
      { module: 'represent', accepted: unify.persist.shelterSurvived && !unify.verification.meshStore, note: 'shelter is a node' },
      { module: 'd-o15', accepted: unify.persist.sameIds, note: 'same ids' },
      { module: 'execute', accepted: unify.kin.bound && unify.labor.conserved && unify.trade.conserved && unify.rain.conserved, note: 'living continuum conserved' },
      { module: 'verify', accepted: !unify.verification.traditionalPipeline && unify.scatter.cloudDimmer && !unify.scatter.rayTraced, note: 'not a renamed engine' },
      { module: 'refine', accepted: unify.health.alpineCirculatoryLower && !unify.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Unir o mundo RRW persistido com parentesco, trabalho e conhecimento falado, sem copiar RPG de engine',
      constraints: ['sem consciência', 'sem TTS', 'sem fechar Gênesis no papel'],
      resources: ['persist', 'kinship', 'labor', 'trade', 'health', 'speech'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...unify,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...unify.verification,
        valid: kernel.verification.valid && unify.verification.valid,
      },
    }
  }
}
