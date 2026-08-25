import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { spatialAdapters } from './adapters.js'
import { normalizeLocal, normalizeSynthetic, unavailable } from './normalize.js'

export class UesSpatialCore {
  private thesis = new DThesisCore()

  process() {
    const synthetic = normalizeSynthetic()
    const local = normalizeLocal()
    const google = unavailable('google-photoreal')
    const nasa = unavailable('nasa-science')
    const kernel = runKernel('Normalizar dados espaciais sem dependência de fornecedor', 'ues.spatial', ['tiles', 'world'], [
      { module: 'knowledge', accepted: true, note: 'adapter catalog' },
      { module: 'd-thesis', accepted: true, note: 'Earth is reference not limit' },
      { module: 'spatial', accepted: synthetic.cells.length > 0 && local.tiles > 1, note: 'internal sources' },
      { module: 'represent', accepted: true, note: 'same semantic cells' },
      { module: 'd-o15', accepted: true, note: 'do not download planet' },
      { module: 'execute', accepted: google.tiles === 0 && nasa.tiles === 0, note: 'externals empty' },
      { module: 'verify', accepted: spatialAdapters.every(item => !item.required), note: 'none required' },
      { module: 'refine', accepted: true, note: 'OGC/Google remain adapters' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Camada espacial da UES sobrevive sem Google/NASA/OGC',
      constraints: ['não tornar fornecedor obrigatório', 'não fingir live tiles'],
      resources: ['synthetic', 'local HLOD'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 4, scalability: 10 },
    })
    return {
      format: 'ues-spatial-v1',
      adapters: spatialAdapters,
      worlds: { synthetic, local, google, nasa },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && spatialAdapters.every(item => !item.required) && local.tiles > 1,
        googleRequired: false,
        nasaRequired: false,
      },
      limitations: ['Internal + synthetic normalize', 'Live Google/NASA/OGC remain adapters'],
    }
  }
}
