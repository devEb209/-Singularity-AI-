import { DThesisCore } from '../d-thesis/core.js'
import { generationLedger } from './ledger.js'
import { generationScore } from './score.js'

export class SnbCompeteCore {
  private thesis = new DThesisCore()

  evaluate() {
    const score = generationScore()
    const dThesis = this.thesis.evaluate({
      objective: 'Medir a primeira geração da SNB contra o critério de competir no lançamento, não contra um recorte reduzido',
      constraints: ['não inflar', 'não tratar V1 como MVP', 'DsOS não é o produto que compete'],
      resources: ['ledger reprodutível'],
      priorities: { quality: 9, performance: 6, safety: 9, cost: 4, scalability: 8 },
    })
    return {
      ...score,
      ledger: generationLedger,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: { valid: score.percent > 0 && score.percent < 100 && score.complete === false && score.reducedFinal === false },
    }
  }
}
