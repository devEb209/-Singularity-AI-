import { DThesisCore } from '../d-thesis/core.js'
import { iterateCcd } from './ccd.js'
import { defaultArm, reach } from './chain.js'

export class UesArticulationCore {
  private thesis = new DThesisCore()

  process() {
    const arm = defaultArm()
    const reachable = iterateCcd(arm, [0.45, 0.22])
    const far = iterateCcd(arm, [4, 0])
    const maxReach = reach(arm)
    const dThesis = this.thesis.evaluate({
      objective: 'Resolver cadeia cinemática com CCD iterativo e limites articulares',
      constraints: ['não reivindicar Featherstone', 'não reivindicar CCD rotacional analítico de corpos rígidos'],
      resources: ['FK', 'iterative CCD'],
      priorities: { quality: 7, performance: 8, safety: 8, cost: 4, scalability: 7 },
    })
    return {
      format: 'ues-articulation-v1',
      reachable: { error: reachable.error, reached: reachable.reached, limits: reachable.limitsHonored },
      unreachable: { error: far.error, reached: far.reached, maxReach },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: reachable.reached && reachable.limitsHonored && far.limitsHonored && !far.reached && far.error > reachable.error && far.error < 4,
        featherstone: false,
        analyticRotationalCcd: false,
      },
      limitations: ['Iterative kinematic CCD', 'Not Featherstone ABA / analytic rigid rotational CCD'],
    }
  }
}
