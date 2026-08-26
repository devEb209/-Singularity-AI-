import { DThesisCore } from '../d-thesis/core.js'
import { runEarth } from '../rrw/earth-run.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwEarthCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const earth = runEarth(prompt)
    const kernel = runKernel('Aprofundar processos da Terra de referência no RRW sem NASA live', 'rrw.earth', ['rrw', 'represent'], [
      { module: 'knowledge', accepted: earth.earth.magnetosphere && !earth.verification.nasaField, note: 'dipole is knowledge, not a live feed' },
      { module: 'd-thesis', accepted: earth.sameIds, note: 'same planet nodes' },
      { module: 'genesis', accepted: earth.verification.valid && !earth.verification.genesisClosed, note: 'deeper, not closed' },
      { module: 'represent', accepted: earth.craft.built && !earth.verification.meshIsFoundation, note: 'shelter gains silica' },
      { module: 'd-o15', accepted: !earth.verification.heightmapIsIdentity, note: 'erosion is not a heightmap' },
      { module: 'execute', accepted: earth.earth.oceanSaltier && earth.transport.dew && earth.transport.struck, note: 'conserved earth transport' },
      { module: 'verify', accepted: !earth.verification.traditionalPipeline && !earth.verification.shaderLightning, note: 'not a renamed engine' },
      { module: 'refine', accepted: earth.earth.moreAcid && !earth.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Aprofundar a Terra de referência no RRW sem copiar GIS/NASA',
      constraints: ['sem NASA live', 'sem shader de relâmpago', 'sem fechar Gênesis no papel'],
      resources: ['salinity', 'erosion', 'magnetosphere', 'dew'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...earth,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...earth.verification,
        valid: kernel.verification.valid && earth.verification.valid,
      },
    }
  }
}
