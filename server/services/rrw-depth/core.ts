import { DThesisCore } from '../d-thesis/core.js'
import { runDepth } from '../rrw/depth-run.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwDepthCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const depth = runDepth(prompt)
    const kernel = runKernel('Aprofundar ciclos e vida RRW sem fingir realidade completa', 'rrw.depth', ['rrw', 'represent'], [
      { module: 'knowledge', accepted: depth.knowledge.remembered && depth.knowledge.culture, note: 'memory and culture are claims' },
      { module: 'd-thesis', accepted: !depth.verification.uniqueFullMinds, note: 'no consciousness' },
      { module: 'genesis', accepted: depth.verification.valid && !depth.verification.genesisClosed, note: 'deeper, not closed' },
      { module: 'represent', accepted: depth.sapling && depth.sameIds, note: 'sapling is a node' },
      { module: 'd-o15', accepted: depth.knowledge.timeNotLod, note: 'time is description' },
      { module: 'execute', accepted: depth.cycles.carbon && depth.cycles.nitrogen && depth.living.grew, note: 'conserved cycles' },
      { module: 'verify', accepted: !depth.verification.traditionalPipeline && !depth.verification.nistAssay, note: 'not a renamed engine' },
      { module: 'refine', accepted: depth.living.olderWeaker && !depth.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Aprofundar a realidade conhecida no RRW sem copiar simulação atômica',
      constraints: ['sem consciência', 'sem NIST', 'sem fechar Gênesis no papel'],
      resources: ['cycles', 'reproduction', 'memory-trace'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...depth,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...depth.verification,
        valid: kernel.verification.valid && depth.verification.valid,
      },
    }
  }
}
