import { DThesisCore } from '../d-thesis/core.js'
import { runCivic } from '../rrw/civic-run.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwCivicCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const civic = runCivic(prompt)
    const kernel = runKernel('Aprofundar normas, censo e extremos climáticos no RRW', 'rrw.civic', ['rrw', 'represent'], [
      { module: 'knowledge', accepted: civic.civic.census >= 3, note: 'census is a claim' },
      { module: 'd-thesis', accepted: !civic.verification.uniqueFullMinds, note: 'no full minds' },
      { module: 'genesis', accepted: civic.verification.valid && !civic.verification.genesisClosed, note: 'deeper, not closed' },
      { module: 'represent', accepted: civic.civic.reserved && !civic.verification.questLog, note: 'norm is not a quest' },
      { module: 'd-o15', accepted: civic.extreme.canopyHelps, note: 'same grove, cooler under canopy' },
      { module: 'execute', accepted: civic.civic.given && civic.extreme.risen && civic.extreme.dust, note: 'gift and extremes execute' },
      { module: 'verify', accepted: !civic.verification.traditionalPipeline && !civic.verification.marketplace, note: 'not a renamed engine' },
      { module: 'refine', accepted: civic.extreme.forestWetter && !civic.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Representar normas e extremos no RRW sem copiar cidade de jogo',
      constraints: ['sem mentes únicas', 'sem marketplace', 'sem fechar Gênesis no papel'],
      resources: ['norms', 'gift', 'heatwave', 'surge'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...civic,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: { ...civic.verification, valid: kernel.verification.valid && civic.verification.valid },
    }
  }
}
