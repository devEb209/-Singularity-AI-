import { DThesisCore } from '../d-thesis/core.js'
import { bilinear, downsample, psnr, sample, unsharp } from './filters.js'
import { interpolate, pacing } from './frameflow.js'

export class UesImageCore {
  private thesis = new DThesisCore()

  process() {
    const native = sample(32, 32, (x, y) => (Math.sin(x * 0.4) * Math.cos(y * 0.35) + 1) / 2)
    const low = downsample(native, 2)
    const reconstructed = unsharp(bilinear(low, 32, 32))
    const score = psnr(native, reconstructed)
    const shifted = sample(32, 32, (x, y) => (Math.sin((x - 2) * 0.4) * Math.cos(y * 0.35) + 1) / 2)
    const mid = interpolate(native, shifted, 0.5)
    const midScore = psnr(native, mid)
    const dThesis = this.thesis.evaluate({
      objective: 'Reconstruir resolução e interpolar frames com filtros próprios',
      constraints: ['não reivindicar SR neural', 'não reivindicar codec'],
      resources: ['CPU'],
      priorities: { quality: 7, performance: 8, safety: 7, cost: 5, scalability: 7 },
    })
    return {
      format: 'ues-image-v1',
      superResolution: { method: 'bilinear+unsharp', psnr: score, learned: false },
      frameFlow: { method: 'block-match-interpolate', psnr: midScore, pacing: pacing([16.6, 16.8, 16.4, 16.7]) },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: score > 18 && mid.pixels.length === native.pixels.length, learned: false },
    }
  }
}
