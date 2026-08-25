import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { gfxBackends } from './backends.js'
import { encodeFrame, type GfxNode } from './encode.js'

export class UesGfxCore {
  private thesis = new DThesisCore()

  process() {
    const nodes: GfxNode[] = [
      { id: 'terrain-near', domain: 'world', influence: 0.9, distance: 1, instances: 1, material: 'granite' },
      { id: 'hero', domain: 'geometry', influence: 0.85, distance: 2, instances: 1, material: 'skin' },
      { id: 'trees', domain: 'world', influence: 0.4, distance: 7, instances: 18, material: 'leaf' },
      { id: 'horizon', domain: 'world', influence: 0.06, distance: 30, instances: 1, material: 'sky' },
      { id: 'crowd', domain: 'npc', influence: 0.2, distance: 12, instances: 40, material: 'cloth' },
    ]
    const frame = encodeFrame(nodes, 'cpu-json')
    const kernel = runKernel('Integrar gráficos da UES com Tese dos D e representação adaptativa', 'ues.gfx', ['represent', 'titko'], [
      { module: 'knowledge', accepted: true, note: 'scene nodes' },
      { module: 'd-thesis', accepted: true, note: 'perceptual draw' },
      { module: 'gfx', accepted: true, note: 'own command stream' },
      { module: 'represent', accepted: frame.culled > 0, note: 'horizon/crowd culled or instanced' },
      { module: 'd-o15', accepted: true, note: 'lod in commands' },
      { module: 'execute', accepted: frame.drawn > 0, note: `${frame.drawn} draws` },
      { module: 'verify', accepted: frame.backend === 'cpu-json', note: 'not vulkan' },
      { module: 'refine', accepted: true, note: 'low-level APIs remain adapters' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'API gráfica própria da UES; Vulkan/DX/GL são backends, não o cérebro',
      constraints: ['não substituir UES por Vulkan', 'não exigir GPU'],
      resources: ['command stream', 'D-O15'],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 4, scalability: 9 },
    })
    return {
      format: 'ues-gfx-v1',
      backends: gfxBackends,
      frame,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: frame.drawn > 0 && frame.culled > 0 && kernel.verification.valid && gfxBackends[0].status === 'IMPLEMENTADO',
        vulkanRequired: false,
        ownsLowLevelApi: false,
      },
      limitations: ['Own command/representation layer', 'Not a Vulkan/DirectX implementation'],
    }
  }
}
