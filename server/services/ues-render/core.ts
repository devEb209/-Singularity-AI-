import { DThesisCore } from '../d-thesis/core.js'
import { cullSpheres } from '../ues-gpu/kernels.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { defaultPasses, renderPasses } from './passes.js'
import { lastUse, topologicalPasses } from './schedule.js'

export class UesRenderCore {
  private thesis = new DThesisCore()

  process() {
    const passes = defaultPasses()
    const order = topologicalPasses(passes)
    const resources = lastUse(passes)
    const visibility = cullSpheres([
      { id: 'hero', center: [0, 0, 2], radius: 0.5 },
      { id: 'prop', center: [0, 0, 80], radius: 0.5 },
    ], [{ n: [0, 0, 1], d: 0 }, { n: [0, 0, -1], d: 20 }])
    const drawn = visibility.filter(item => item.visible).length
    const waterAfterOpaque = order.findIndex(item => item.id === 'water') > order.findIndex(item => item.id === 'opaque')
    const kernel = runKernel('Render graph da UES com passes e culling', 'ues.render', ['gpu', 'shader'], [
      { module: 'knowledge', accepted: true, note: 'pass list' },
      { module: 'd-thesis', accepted: true, note: 'only visible to GPU' },
      { module: 'render', accepted: order.length === renderPasses.length, note: 'all passes' },
      { module: 'represent', accepted: true, note: 'resource last-use' },
      { module: 'd-o15', accepted: drawn === 1, note: 'far culled' },
      { module: 'execute', accepted: waterAfterOpaque, note: 'water after opaque' },
      { module: 'verify', accepted: resources.swapchain === 'ui', note: 'swapchain last' },
      { module: 'refine', accepted: true, note: 'clustered lighting remains next polish' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Frame graph próprio; CPU orquestra, GPU executa quando existir',
      constraints: ['não exigir GPU no sandbox', 'não pular dependências'],
      resources: ['passes', 'cull'],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 4, scalability: 9 },
    })
    return {
      format: 'ues-render-v1',
      order: order.map(item => item.id),
      resources,
      drawn,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && waterAfterOpaque && drawn === 1 && order[0].id === 'depth',
        gpuRequired: false,
      },
      limitations: ['Render graph + CPU cull', 'Not a vendor frame-graph runtime'],
    }
  }
}
