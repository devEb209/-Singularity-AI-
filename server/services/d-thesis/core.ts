import { createHash } from 'node:crypto'
import { generateCandidates } from './candidates.js'
import { optimizeDO15 } from './optimizer.js'
import { candidateScore, localPerfectPoints } from './perfect-point.js'
import { refine } from './refinement.js'
import { selectDs } from './selector.js'
import { dThesisScope, type DContext } from './types.js'

export class DThesisCore {
  evaluate(context: DContext) {
    const selectedDs = selectDs(context)
    const candidates = generateCandidates(context)
      .map(candidate => ({ ...candidate, score: candidateScore(candidate, context) }))
      .sort((a, b) => b.score - a.score)
    const initial = candidates[0]
    const localPP = localPerfectPoints(selectedDs.map(item => item.key), initial, context)
    const optimization = optimizeDO15(initial, context)
    const refinement = refine(optimization.optimized, context)
    const gppScore = candidateScore(refinement.candidate, context)
    const gpp = {
      candidate: refinement.candidate.id,
      score: gppScore,
      contextHash: createHash('sha256').update(JSON.stringify(context)).digest('hex'),
      tradeoffs: localPP.filter(item => item.localScore < gppScore).map(item => ({
        d: item.d,
        local: item.localScore,
        global: gppScore,
        reason: 'local sacrifice may improve global weighted balance',
      })),
      dynamic: true,
      absolutePerfectionClaim: false,
    }
    return {
      format: 'snb-ues-d-thesis-v1',
      thesis: 'functional reasoning matrix; not physical or mathematical dimensions',
      context,
      selectedDs,
      candidates,
      localPerfectPoints: localPP,
      dO15: optimization,
      refinement,
      gpp,
      governance: {
        allDsAvailable: true,
        allDsRequiredPerTask: false,
        userControl: true,
        autonomousByDefault: true,
        recalculateOnNewInformation: true,
      },
      scope: dThesisScope,
    }
  }
}
