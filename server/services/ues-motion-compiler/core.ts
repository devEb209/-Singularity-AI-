import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { bake } from '../ues-umotion/apply.js'
import { resolveMotionSource } from '../ues-umotion/adapters.js'
import { compileMotionPrompt } from './recipes.js'

export class UesMotionCompilerCore {
  private thesis = new DThesisCore()

  process(prompt = 'FN FAL recarregando') {
    const card = compileMotionPrompt(prompt)
    const baked = bake(card, 12)
    const video = resolveMotionSource('video-vision')
    const kernel = runKernel(`Compilar movimento para ${prompt}`, 'ues.motion-compiler', ['biomechanics', 'umotion'], [
      { module: 'knowledge', accepted: true, note: 'mechanics, not footage' },
      { module: 'd-thesis', accepted: true, note: 'continuity over spectacle' },
      { module: 'motion-compiler', accepted: baked.continuity, note: card.id },
      { module: 'represent', accepted: true, note: 'joint curves' },
      { module: 'd-o15', accepted: true, note: '12 samples' },
      { module: 'execute', accepted: baked.frames.length === 12, note: 'hermite bake' },
      { module: 'verify', accepted: baked.continuity && !video.executable, note: 'no vision claim' },
      { module: 'refine', accepted: true, note: 'video remains adapter' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: `Gerar animação a partir da mecânica de ${prompt}`,
      constraints: ['não exigir captura do usuário', 'não fingir visão'],
      resources: ['biomechanics recipes', 'Hermite'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 4, scalability: 7 },
    })
    return {
      format: 'ues-motion-compiler-v1',
      prompt,
      card: { id: card.id, subject: card.subject, keys: card.keys.length },
      frames: baked.frames.length,
      continuity: baked.continuity,
      video: video.status,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: baked.continuity && kernel.verification.valid, vision: false, userCaptureRequired: false },
      limitations: ['Biomechanical recipes + structured bake', 'Not video reconstruction'],
    }
  }
}
