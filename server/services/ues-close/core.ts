import { DThesisCore } from '../d-thesis/core.js'
import { creationPlan } from '../ues-creation/plan.js'
import { UesGfxCore } from '../ues-gfx/core.js'
import { UesKernelCore } from '../ues-kernel/core.js'
import { UesMotionCompilerCore } from '../ues-motion-compiler/core.js'
import { UesNmnWorldCore } from '../ues-nmn-world/core.js'
import { UesRepresentCore } from '../ues-represent/core.js'
import { UesSemantic3dCore } from '../ues-semantic-3d/core.js'
import { hashSeed } from '../ues-shared/math.js'
import { heightField } from '../ues-planet/height.js'
import { waterFidelity } from '../ues-fnws/fidelity.js'

export class UesCloseCore {
  private thesis = new DThesisCore()
  private kernel = new UesKernelCore()
  private represent = new UesRepresentCore()
  private semantic = new UesSemantic3dCore()
  private gfx = new UesGfxCore()
  private motion = new UesMotionCompilerCore()
  private nmn = new UesNmnWorldCore()

  process(prompt = 'ponte de pedra e FN FAL recarregando') {
    const kernel = this.kernel.process(prompt)
    const represent = this.represent.process('balanced')
    const object = this.semantic.process(/ponte|drone|lanterna|mesa|hexagon/.test(prompt.toLowerCase()) ? prompt : 'ponte de pedra com dois arcos')
    const gfx = this.gfx.process()
    const motion = this.motion.process(/recarga|fal|andar|sent/.test(prompt.toLowerCase()) ? prompt : 'FN FAL recarregando')
    const nmn = this.nmn.process('close')
    const waterNear = waterFidelity(heightField(hashSeed('earth-like'), 16), [8, 8], 2)
    const waterFar = waterFidelity(heightField(hashSeed('earth-like'), 16), [8, 8], 28)
    const creation = creationPlan(prompt, 12)
    const dThesis = this.thesis.evaluate({
      objective: `Fechar geração 1: ${prompt}. Conhecimento → Tese → módulo → representação → D-O15 → execução → verificação.`,
      constraints: ['sem externo obrigatório', 'sem fingir', 'DsOS não bloqueia'],
      resources: ['kernel', 'semantic-3d', 'gfx', 'motion', 'nmn', 'fnws'],
      priorities: { quality: 8, performance: 8, safety: 9, cost: 4, scalability: 9 },
    })
    return {
      format: 'ues-close-v1',
      complement: 'does-not-replace-tese-dos-d',
      kernel: kernel.verification,
      represent: represent.verification,
      semantic3d: { kind: object.semantic.identity.kind, catalogBound: object.verification.catalogBound, valid: object.verification.valid },
      gfx: { drawn: gfx.frame.drawn, vulkanRequired: gfx.verification.vulkanRequired },
      motion: { vision: motion.verification.vision, userCaptureRequired: motion.verification.userCaptureRequired },
      nmn: { actions: nmn.distinctActions.length, consciousness: nmn.consciousnessClaim },
      water: { near: waterNear.detailed, far: waterFar.detailed, farKind: waterFar.kind },
      creation,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: kernel.verification.valid
          && represent.verification.valid
          && object.verification.valid
          && gfx.verification.valid
          && motion.verification.valid
          && nmn.verification.valid
          && waterNear.detailed
          && !waterFar.detailed
          && creation.verification.valid,
        catalogBound: false,
        vulkanRequired: false,
        vision: false,
        instantAaa: false,
      },
    }
  }
}
