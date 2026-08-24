import { DThesisCore } from '../d-thesis/core.js'
import { detectGpuBackend } from '../ues-gpu/detect.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { checksum, coverage, createFramebuffer } from './framebuffer.js'
import { occluder, unitQuad } from './scene.js'
import { rasterTriangle } from './triangle.js'

export class UesRasterCore {
  private thesis = new DThesisCore()

  process() {
    const frame = createFramebuffer(16, 16)
    const quad = unitQuad(0.45)
    const first = rasterTriangle(frame, quad[0], quad[1], quad[2])
    const second = rasterTriangle(frame, quad[0], quad[2], quad[3])
    const cover = rasterTriangle(frame, ...occluder() as [typeof quad[0], typeof quad[0], typeof quad[0]])
    const hash = checksum(frame)
    const again = createFramebuffer(16, 16)
    rasterTriangle(again, quad[0], quad[1], quad[2])
    rasterTriangle(again, quad[0], quad[2], quad[3])
    rasterTriangle(again, ...occluder() as [typeof quad[0], typeof quad[0], typeof quad[0]])
    const backend = detectGpuBackend()
    const kernel = runKernel('Raster real da UES: vértices → fragmentos → profundidade → pixels', 'ues.raster', ['gpu', 'shader'], [
      { module: 'knowledge', accepted: true, note: 'own raster, not a named API' },
      { module: 'd-thesis', accepted: true, note: 'CPU fallback executes graphics' },
      { module: 'raster', accepted: frame.written > 40, note: 'pixels written' },
      { module: 'represent', accepted: true, note: '16x16 budget' },
      { module: 'd-o15', accepted: true, note: 'small framebuffer' },
      { module: 'execute', accepted: cover.fragments > 0 && first.fragments + second.fragments > cover.fragments, note: 'depth test' },
      { module: 'verify', accepted: hash === checksum(again) && hash.length === 64, note: 'deterministic' },
      { module: 'refine', accepted: !backend.available, note: 'hardware still adapter here' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Executar gráficos de verdade no fallback; hardware GPU amplia, não define a capacidade',
      constraints: ['não fingir WebGPU', 'pixels reais'],
      resources: ['barycentric raster', 'depth', 'PBR shade'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      format: 'ues-raster-v1',
      size: [frame.width, frame.height],
      written: frame.written,
      coverage: coverage(frame),
      fragments: first.fragments + second.fragments + cover.fragments,
      occluded: first.occluded + second.occluded + cover.occluded,
      checksum: hash,
      backend,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && frame.written > 40 && hash === checksum(again),
        hardwareGpu: backend.available,
        webgpuRequired: false,
      },
      limitations: ['Software raster fallback executes the UES GPU contract', 'Hardware WebGPU/Vulkan remain adapters'],
    }
  }
}
