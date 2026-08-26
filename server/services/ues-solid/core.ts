import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { booleanSolids, defaultPair } from './csg.js'
import { loftProfiles, sweepPolyline } from './loft.js'
import { unwrapBox } from './unwrap.js'

export class UesSolidCore {
  private thesis = new DThesisCore()

  process(prompt = 'bloco com recorte esferico') {
    const pair = defaultPair()
    const subtracted = booleanSolids(pair.left, pair.right, 'subtract')
    const united = booleanSolids(pair.left, pair.right, 'union')
    const intersected = booleanSolids(pair.left, pair.right, 'intersect')
    const loft = loftProfiles({ y: 0, hx: 0.4, hz: 0.25 }, { y: 0.8, hx: 0.18, hz: 0.18 })
    const sweep = sweepPolyline([[0, 0.1, 0], [0.6, 0.2, 0], [0.6, 0.2, 0.6], [0.1, 0.35, 0.6]], 0.08, 6)
    const uvs = unwrapBox(loft)
    const kernel = runKernel(`Geometria construtiva para ${prompt}`, 'ues.solid', ['sdf', 'csg', 'loft'], [
      { module: 'knowledge', accepted: true, note: 'implicit primitives' },
      { module: 'd-thesis', accepted: true, note: 'open constructive class' },
      { module: 'solid', accepted: subtracted.counts.result < subtracted.counts.left, note: subtracted.op },
      { module: 'represent', accepted: true, note: 'occupancy + cuberille' },
      { module: 'd-o15', accepted: true, note: '20^3 grid' },
      { module: 'execute', accepted: loft.triangles.length > 0 && sweep.triangles.length > 0, note: 'loft/sweep' },
      { module: 'verify', accepted: united.counts.result >= Math.max(subtracted.counts.left, subtracted.counts.right) && intersected.counts.result <= Math.min(united.counts.left, united.counts.right), note: 'boolean inequalities' },
      { module: 'refine', accepted: uvs.verification.valid, note: 'box unwrap' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: `Construir 3D arbitrário por SDF/CSG/loft, não só 9 kinds, para ${prompt}`,
      constraints: ['não reivindicar image-to-3D', 'sem ferramenta externa'],
      resources: ['SDF', 'cuberille', 'loft', 'sweep'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      format: 'ues-solid-v1',
      prompt,
      csg: {
        subtract: { volume: subtracted.volume, cells: subtracted.counts.result, triangles: subtracted.mesh.triangles },
        union: { volume: united.volume, cells: united.counts.result },
        intersect: { volume: intersected.volume, cells: intersected.counts.result },
      },
      loft: { vertices: loft.vertices.length, triangles: loft.triangles.length },
      sweep: { vertices: sweep.vertices.length, triangles: sweep.triangles.length },
      uv: { islands: uvs.islands, faces: uvs.faces },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid
          && subtracted.counts.result < subtracted.counts.left
          && united.counts.result > subtracted.counts.result
          && intersected.counts.result < subtracted.counts.left
          && loft.triangles.length >= 12
          && sweep.triangles.length > 0
          && uvs.verification.valid,
        specialistDerived: false,
        imageTo3d: false,
      },
      limitations: ['SDF occupancy + constructive mesh', 'Not learned image-to-3D'],
    }
  }
}
