import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { nothingErased, promote, seedLinks, seedUniverses } from './universe.js'

export class SnbCanonCore {
  private thesis = new DThesisCore()

  process() {
    const before = seedUniverses()
    const after = promote(before, 'mirror')
    const links = seedLinks()
    const kernel = runKernel('Canon SNB: promover sem apagar universos anteriores', 'snb.canon', ['toolbox'], [
      { module: 'knowledge', accepted: true, note: 'layers' },
      { module: 'd-thesis', accepted: true, note: 'community may fork' },
      { module: 'canon', accepted: after.find(item => item.id === 'mirror')?.layer === 'main', note: 'promoted' },
      { module: 'represent', accepted: true, note: 'archived remains' },
      { module: 'd-o15', accepted: true, note: 'not all canons resident' },
      { module: 'execute', accepted: nothingErased(before, after) && after.find(item => item.id === 'prime')?.layer === 'archived', note: 'nothing erased' },
      { module: 'verify', accepted: links.some(item => item.relation === 'forks'), note: 'relations' },
      { module: 'refine', accepted: true, note: 'not a live store' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Lore versionada; comunidade cria caminhos sem destruir o canon',
      constraints: ['não apagar universo', 'não fingir marketplace'],
      resources: ['layers', 'links'],
      priorities: { quality: 8, performance: 6, safety: 9, cost: 3, scalability: 8 },
    })
    return {
      format: 'snb-canon-v1',
      before: before.length,
      after: after.map(item => ({ id: item.id, layer: item.layer, active: item.active })),
      links: links.length,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: kernel.verification.valid && nothingErased(before, after), marketplaceLive: false },
      limitations: ['Canon graph foundation, not a published store'],
    }
  }
}
