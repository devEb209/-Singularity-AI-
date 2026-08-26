import { DThesisCore } from '../d-thesis/core.js'
import { compare } from './metrics.js'
import { scene } from './raster.js'

export class UesRegressCore {
  private thesis = new DThesisCore()

  process() {
    const native = scene('base')
    const shifted = scene('shift')
    const broken = scene('corrupt')
    const mild = compare(native, shifted)
    const harsh = compare(native, broken)
    const identity = compare(native, native)
    const dThesis = this.thesis.evaluate({
      objective: 'Regredir qualidade de raster CPU e recusar perda além da fronteira D-O15',
      constraints: ['não reivindicar renderer GPU', 'rollback se PSNR/SSIM cair'],
      resources: ['CPU raster'],
      priorities: { quality: 9, performance: 7, safety: 8, cost: 5, scalability: 6 },
    })
    return {
      format: 'ues-regress-v1',
      identity,
      mild,
      harsh,
      rollback: !harsh.accept,
      accepted: mild.accept && identity.accept,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: identity.ssim > 0.99 && identity.psnr >= 40 && mild.accept && !harsh.accept && identity.ssim > mild.ssim && mild.ssim > harsh.ssim,
        gpu: false,
      },
      limitations: ['CPU gray raster compare', 'Not GPU renderer image regression'],
    }
  }
}
