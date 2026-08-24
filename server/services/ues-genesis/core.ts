import { DThesisCore } from '../d-thesis/core.js'
import { SnbToolboxCore } from '../snb-toolbox/core.js'
import { creationPlan } from '../ues-creation/plan.js'
import { initWater } from '../ues-fnws/cycle.js'
import { shallowStep } from '../ues-fnws/shallow.js'
import { UesGpuCore } from '../ues-gpu/core.js'
import { UesImage3dCore } from '../ues-image3d/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { UesPopulationCore } from '../ues-population/core.js'
import { UesRenderCore } from '../ues-render/core.js'
import { UesShaderCore } from '../ues-shader/core.js'
import { UesRasterCore } from '../ues-raster/core.js'
import { UesScalePolicyCore } from '../ues-scale-policy/core.js'
import { UesSpatialCore } from '../ues-spatial/core.js'
import { UesWorldKnowledgeCore } from '../ues-world-knowledge/core.js'

export class UesGenesisCore {
  private thesis = new DThesisCore()
  private gpu = new UesGpuCore()
  private shader = new UesShaderCore()
  private render = new UesRenderCore()
  private image3d = new UesImage3dCore()
  private spatial = new UesSpatialCore()
  private population = new UesPopulationCore()
  private toolbox = new SnbToolboxCore()
  private raster = new UesRasterCore()
  private knowledge = new UesWorldKnowledgeCore()
  private scale = new UesScalePolicyCore()

  process(prompt = 'genese: mundo, gpu e ecossistema') {
    const gpu = this.gpu.process()
    const shader = this.shader.process()
    const render = this.render.process()
    const image3d = this.image3d.process(prompt)
    const spatial = this.spatial.process()
    const population = this.population.process(prompt.slice(0, 24) || 'genesis')
    const toolbox = this.toolbox.process()
    const raster = this.raster.process()
    const knowledge = this.knowledge.process('earth')
    const scale = this.scale.process()
    const water = shallowStep(initWater([[-1, -1], [-1, 0.2]]), [[-1, -1], [-1, 0.2]])
    const creation = creationPlan(prompt, 24)
    const kernel = runKernel(`Gênesis V1: ${prompt}`, 'ues.genesis', ['gpu', 'shader', 'spatial', 'toolbox'], [
      { module: 'knowledge', accepted: true, note: 'internal + adapters' },
      { module: 'd-thesis', accepted: true, note: 'universal, not game-only' },
      { module: 'genesis', accepted: gpu.verification.valid && shader.verification.valid && render.verification.valid, note: 'gpu stack' },
      { module: 'represent', accepted: spatial.verification.valid && !spatial.verification.googleRequired, note: 'earth not vendor' },
      { module: 'd-o15', accepted: population.verification.valid && !population.verification.uniqueMillionMinds, note: 'statistical million' },
      { module: 'execute', accepted: image3d.verification.valid && !image3d.verification.heightfieldOnly && raster.verification.valid, note: 'reconstruct + raster pixels' },
      { module: 'verify', accepted: toolbox.verification.valid && knowledge.verification.valid && !scale.verification.fixedCap && water.volume >= 0, note: 'ecosystem + knowledge' },
      { module: 'refine', accepted: creation.verification.valid && !creation.instantAaa, note: 'not instant AAA' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Primeira geração competitiva: arquitetura que escala, sem checkbox falso',
      constraints: ['sem externo obrigatório', 'sem fingir GPU/Puter/NASA', 'DsOS não bloqueia'],
      resources: ['gpu api', 'shader ir', 'spatial', 'toolbox'],
      priorities: { quality: 8, performance: 8, safety: 9, cost: 4, scalability: 10 },
    })
    return {
      format: 'ues-genesis-v1',
      complement: 'does-not-replace-tese-dos-d',
      gpu: { drawn: gpu.frame.drawn, webgpuRequired: gpu.verification.webgpuRequired },
      shader: { optimized: shader.optimized, spirvRequired: shader.verification.spirvRequired },
      render: { passes: render.order.length, gpuRequired: render.verification.gpuRequired },
      image3d: { peak: image3d.mesh.peak, learnedVision: image3d.verification.learnedVision },
      spatial: { googleRequired: spatial.verification.googleRequired, nasaRequired: spatial.verification.nasaRequired },
      population: { statistical: population.statistical, uniqueMillionMinds: population.verification.uniqueMillionMinds },
      toolbox: { assets: toolbox.assets, marketplaceLive: toolbox.verification.marketplaceLive },
      raster: { written: raster.written, hardwareGpu: raster.verification.hardwareGpu },
      knowledge: { biomes: knowledge.earth.biomes, earthIsLimit: knowledge.verification.earthIsLimit },
      scale: { fixedCap: scale.verification.fixedCap, requested: scale.requested },
      water: { volume: Number(water.volume.toFixed(5)), compute: water.compute },
      creation,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: kernel.verification.valid
          && gpu.verification.valid
          && shader.verification.valid
          && render.verification.valid
          && image3d.verification.valid
          && spatial.verification.valid
          && population.verification.valid
          && toolbox.verification.valid
          && creation.verification.valid,
        webgpuRequired: false,
        automaticPuter: false,
        googleRequired: false,
        instantAaa: false,
      },
    }
  }
}
