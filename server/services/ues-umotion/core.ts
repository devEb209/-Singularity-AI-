import { DThesisCore } from '../d-thesis/core.js'
import { resolveMotionSource } from './adapters.js'
import { bake } from './apply.js'
import { reloadFal } from './cards.js'
import { motionCatalog } from './catalog.js'
import { applyPromptToCatalog } from './explorer.js'

export class UesUmotionCore {
  private thesis = new DThesisCore()

  process() {
    const baked = bake(reloadFal, 14)
    const video = resolveMotionSource('video-vision')
    const applied = applyPromptToCatalog('recarga FN FAL', 'personagem humano')
    const dThesis = this.thesis.evaluate({
      objective: 'Aplicar animação a partir de referência estruturada, sem análise de vídeo',
      constraints: ['não reivindicar visão', 'pesquisa web de vídeo é adapter Puter'],
      resources: ['motion cards', 'Hermite blend', 'explorer apply'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 7 },
    })
    return {
      format: 'ues-umotion-v1',
      card: { id: reloadFal.id, subject: reloadFal.subject, source: reloadFal.source },
      catalog: motionCatalog.map(item => item.id),
      frames: baked.frames.length,
      continuity: baked.continuity,
      explorer: { model: applied.model.id, applied: applied.applied.length, missing: applied.missing.length },
      adapters: { video: video.status, executable: video.executable },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: baked.continuity && baked.frames.length === 14 && applied.verification.valid && !video.executable,
        vision: false,
        videoSearch: 'adapter-required',
      },
      limitations: ['Structured motion cards', 'Not video/vision analysis'],
    }
  }
}
