import { DThesisCore } from '../d-thesis/core.js'
import { bake } from './apply.js'
import { reloadFal } from './cards.js'

export class UesUmotionCore {
  private thesis = new DThesisCore()

  process() {
    const baked = bake(reloadFal, 14)
    const dThesis = this.thesis.evaluate({
      objective: 'Aplicar animação a partir de referência estruturada, sem análise de vídeo',
      constraints: ['não reivindicar visão', 'pesquisa web de vídeo é adapter Puter'],
      resources: ['motion cards', 'Hermite blend'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 7 },
    })
    return {
      format: 'ues-umotion-v1',
      card: { id: reloadFal.id, subject: reloadFal.subject, source: reloadFal.source },
      frames: baked.frames.length,
      continuity: baked.continuity,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: baked.continuity && baked.frames.length === 14, vision: false, videoSearch: 'adapter-required' },
      limitations: ['Structured motion cards', 'Not video/vision analysis'],
    }
  }
}
