import { DThesisCore } from '../d-thesis/core.js'
import { runSphere } from '../rrw/sphere-run.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwSphereCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const sphere = runSphere(prompt)
    const kernel = runKernel('Aprofundar hidrosfera, criosfera, geoesfera e atmosfera RRW', 'rrw.sphere', ['rrw', 'represent'], [
      { module: 'knowledge', accepted: sphere.atmo.ozone && !sphere.verification.nistAssay, note: 'UV attenuation is not NIST O3' },
      { module: 'd-thesis', accepted: sphere.sameIds, note: 'aquifer added, originals survive' },
      { module: 'genesis', accepted: sphere.verification.valid && !sphere.verification.genesisClosed, note: 'deeper, not closed' },
      { module: 'represent', accepted: sphere.hydro.stored && !sphere.verification.shaderWater, note: 'aquifer is a node' },
      { module: 'd-o15', accepted: !sphere.verification.gisCatchment, note: 'watershed is not a GIS product' },
      { module: 'execute', accepted: sphere.hydro.flooded && sphere.cryo.alpineIced && sphere.geo.erupted, note: 'spheres execute' },
      { module: 'verify', accepted: !sphere.verification.traditionalPipeline && !sphere.verification.particleLava, note: 'not a renamed engine' },
      { module: 'refine', accepted: sphere.atmo.inversion && !sphere.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Aprofundar as esferas da Terra de referência sem NASA live',
      constraints: ['sem NASA', 'sem shader de água/gelo', 'sem fechar Gênesis no papel'],
      resources: ['groundwater', 'glacier', 'volcano', 'ozone'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...sphere,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: { ...sphere.verification, valid: kernel.verification.valid && sphere.verification.valid },
    }
  }
}
