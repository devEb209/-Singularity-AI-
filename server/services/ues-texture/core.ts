import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { buildMips, sampleMip } from './mip.js'
import { checker, sampleBilinear } from './sample.js'

export class UesTextureCore {
  private thesis = new DThesisCore()

  process() {
    const base = checker(8)
    const mips = buildMips(base)
    const sharp = sampleBilinear(base, 0.0625, 0.0625)
    const neighbor = sampleBilinear(base, 0.1875, 0.0625)
    const lod = sampleMip(mips, 0.5, 0.5, 2)
    const kernel = runKernel('Amostragem de textura própria com bilinear e mips', 'ues.texture', ['titko'], [
      { module: 'knowledge', accepted: true, note: 'procedural checker' },
      { module: 'd-thesis', accepted: true, note: 'no stored 16K' },
      { module: 'texture', accepted: Math.abs(sharp[0] - neighbor[0]) > 0.1, note: 'cells differ' },
      { module: 'represent', accepted: true, note: 'virtual mips' },
      { module: 'd-o15', accepted: mips.length >= 4 && mips.at(-1)!.width === 1, note: 'mip to 1' },
      { module: 'execute', accepted: lod.every(Number.isFinite), note: 'trilinear' },
      { module: 'verify', accepted: base.pixels.length === 192, note: '8x8 rgb' },
      { module: 'refine', accepted: true, note: 'not a GPU sampler' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Textura que executa; bitmap 16K não é o critério',
      constraints: ['não alocar 16K', 'bilinear real'],
      resources: ['checker', 'mip'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'ues-texture-v1',
      size: [base.width, base.height],
      mips: mips.length,
      sharp,
      lod,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: kernel.verification.valid && mips.length >= 4, storedBitmap16k: false },
      limitations: ['Procedural + CPU bilinear/mips', 'Not GPU anisotropic filtering'],
    }
  }
}
