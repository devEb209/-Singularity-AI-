import { DThesisCore } from '../d-thesis/core.js'
import { runPersist } from '../rrw/persist-run.js'
import { worldIdOf } from '../rrw/world-id.js'
import { WorldStore } from '../rrw/world-store.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwPersistCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo', store = new WorldStore(), worldId?: string) {
    const persist = runPersist(prompt, 4, store, worldId ?? worldIdOf(prompt, 'persist'))
    const kernel = runKernel('Persistir o mundo RRW entre operações sem virar save de engine', 'rrw.persist', ['rrw', 'session'], [
      { module: 'knowledge', accepted: persist.queried.found, note: 'query after reload' },
      { module: 'd-thesis', accepted: !persist.verification.uniqueFullMinds, note: 'no consciousness' },
      { module: 'genesis', accepted: persist.verification.valid && !persist.verification.genesisClosed, note: 'held, not closed' },
      { module: 'represent', accepted: persist.shelterSurvived && !persist.verification.meshStore, note: 'envelope is not a mesh store' },
      { module: 'd-o15', accepted: persist.sameIds && persist.presented.sameIds, note: 'same ids after reload' },
      { module: 'execute', accepted: persist.fireCooled && persist.reloaded && persist.lineageGrew, note: 'continue from stored envelope' },
      { module: 'verify', accepted: !persist.verification.traditionalPipeline && persist.share.owner && !persist.share.stranger, note: 'ACL without WebRTC' },
      { module: 'refine', accepted: persist.lineageGrew && !persist.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Manter o mesmo mundo RRW entre pedidos, sem copiar savegame de engine',
      constraints: ['sem consciência', 'sem mesh store', 'sem fechar Gênesis no papel'],
      resources: ['world-store', 'envelope', 'live-hour'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...persist,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...persist.verification,
        valid: kernel.verification.valid && persist.verification.valid,
      },
    }
  }
}
