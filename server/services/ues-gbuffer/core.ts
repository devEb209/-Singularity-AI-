import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { createGBuffer, writeGBuffer } from './layout.js'

export class UesGBufferCore {
  private thesis = new DThesisCore()

  process() {
    const buffer = createGBuffer(8, 8)
    const far = writeGBuffer(buffer, 3, 3, 0.8, {
      albedo: [1, 0, 0],
      normal: [0, 1, 0],
      world: [0, 0, 0],
      uv: [0, 0],
      roughness: 0.5,
      metalness: 0,
      emission: [0, 0, 0],
      material: 0,
    })
    const near = writeGBuffer(buffer, 3, 3, 0.2, {
      albedo: [0, 0, 1],
      normal: [0, 1, 0],
      world: [0, 0.2, 0],
      uv: [0.5, 0.5],
      roughness: 0.2,
      metalness: 1,
      emission: [0, 0, 0],
      material: 1,
    })
    const kernel = runKernel('G-buffer próprio com teste de profundidade', 'ues.gbuffer', ['raster'], [
      { module: 'knowledge', accepted: true, note: 'deferred fields' },
      { module: 'd-thesis', accepted: true, note: 'only written pixels' },
      { module: 'gbuffer', accepted: far && near, note: 'both writes attempted' },
      { module: 'represent', accepted: true, note: 'albedo/normal/material' },
      { module: 'd-o15', accepted: true, note: '8x8 fixture' },
      { module: 'execute', accepted: buffer.albedo[3 * 8 * 3 + 3 * 3 + 2] === 1 && buffer.material[3 * 8 + 3] === 1, note: 'near wins' },
      { module: 'verify', accepted: buffer.written === 1, note: 'one occupant' },
      { module: 'refine', accepted: true, note: 'not a vendor G-buffer' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Campos deferred reais para iluminação posterior',
      constraints: ['depth test', 'sem GPU obrigatória'],
      resources: ['gbuffer'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'ues-gbuffer-v1',
      written: buffer.written,
      metalness: buffer.metalness[3 * 8 + 3],
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: kernel.verification.valid && buffer.written === 1 },
      limitations: ['CPU G-buffer', 'Not a hardware MRT layout'],
    }
  }
}
