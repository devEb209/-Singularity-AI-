import { DThesisCore } from '../d-thesis/core.js'
import { runLoop } from '../rrw/loop.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwLoopCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado sob céu nublado com fogo, floresta e um humano') {
    const loop = runLoop(prompt, 4)
    const kernel = runKernel('Laço Gênesis: intenção → conhecimento → RRW → D-O15 → verificação → refino', 'rrw.loop', ['rrw', 'intent'], [
      { module: 'knowledge', accepted: loop.knowledge.puterFired === false && loop.knowledge.nasa === false, note: 'internal consult' },
      { module: 'd-thesis', accepted: loop.intent.realismRequired === false, note: 'realism not mandatory' },
      { module: 'intent', accepted: Boolean(loop.intent.biome), note: 'biome from description' },
      { module: 'represent', accepted: loop.composed.heightfieldIsIdentity === false, note: 'composed reality' },
      { module: 'd-o15', accepted: loop.devices.sameIds && loop.living.sameIds, note: 'same ids' },
      { module: 'execute', accepted: loop.verification.valid, note: 'loop executes' },
      { module: 'verify', accepted: !loop.verification.traditionalPipeline && !loop.present.framebufferFoundation, note: 'not a renamed engine' },
      { module: 'refine', accepted: loop.history.lineagePreserved && !loop.verification.genesisClosed, note: 'honest close' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Fechar o laço intenção→materialização sem fingir Gênesis completa',
      constraints: ['sem Puter falso', 'sem NASA', 'sem Unreal', 'catálogo aberto'],
      resources: ['compose', 'D-O15', 'critic', 'history'],
      priorities: { quality: 9, performance: 8, safety: 9, cost: 3, scalability: 10 },
    })
    return {
      ...loop,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...loop.verification,
        valid: kernel.verification.valid && loop.verification.valid,
      },
    }
  }
}
