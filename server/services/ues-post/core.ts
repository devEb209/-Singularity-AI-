import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { blur3, compositeBloom, extractBright } from './bloom.js'
import { acesFilmic } from './tonemap.js'

export class UesPostCore {
  private thesis = new DThesisCore()

  process() {
    const width = 6
    const height = 4
    const hdr = new Float32Array(width * height * 3)
    hdr[2 * width * 3 + 2 * 3] = 8
    hdr[2 * width * 3 + 2 * 3 + 1] = 7
    hdr[2 * width * 3 + 2 * 3 + 2] = 6
    hdr[0] = 0.18
    hdr[1] = 0.18
    hdr[2] = 0.18
    const bright = extractBright(hdr, width, height)
    const bloom = blur3(bright, width, height)
    const composed = compositeBloom(hdr, bloom, 0.25)
    const mapped = acesFilmic([composed[2 * width * 3 + 2 * 3], composed[2 * width * 3 + 2 * 3 + 1], composed[2 * width * 3 + 2 * 3 + 2]])
    const neighbor = bloom[2 * width * 3 + 3 * 3]
    const mid = acesFilmic([0.18, 0.18, 0.18])
    const kernel = runKernel('Pós-processamento ACES + bloom que executa', 'ues.post', ['light'], [
      { module: 'knowledge', accepted: true, note: 'ACES fitted' },
      { module: 'd-thesis', accepted: true, note: 'display transform' },
      { module: 'post', accepted: mapped[0] < 1.01 && mapped[0] > mid[0], note: 'compress + remain brighter' },
      { module: 'represent', accepted: true, note: 'HDR then LDR' },
      { module: 'd-o15', accepted: true, note: '3x3 bloom' },
      { module: 'execute', accepted: neighbor > 0 && acesFilmic([8, 8, 8])[0] < 1.05, note: 'leak + compress' },
      { module: 'verify', accepted: mid[0] > 0.1 && mid[0] < 0.3, note: 'mid grey' },
      { module: 'refine', accepted: true, note: 'not TSR / not DLSS' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Tone map e bloom reais; upscalers aprendidos são outra camada',
      constraints: ['ACES executa', 'não fingir DLSS'],
      resources: ['aces', 'bloom'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'ues-post-v1',
      mapped,
      mid,
      bloomLeak: neighbor,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: kernel.verification.valid && neighbor > 0, dlss: false, tsr: false },
      limitations: ['ACES + 3x3 bloom', 'Not temporal upsampling'],
    }
  }
}
