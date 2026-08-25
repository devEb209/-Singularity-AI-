import { DThesisCore } from '../d-thesis/core.js'
import { catalog } from '../ues-corpus/catalog.js'
import { meshEntry } from '../ues-corpus/generate.js'
import { anatomyReport } from './anatomy.js'
import { crossingFixture, geometryReport } from './geometry.js'

export class UesCriticCore {
  private thesis = new DThesisCore()

  process() {
    const human = meshEntry(catalog.find(item => item.kind === 'humanoid')!, 5)
    const crate = meshEntry(catalog.find(item => item.kind === 'crate')!, 5)
    const humanGeo = geometryReport({ vertices: human.mesh.vertices, triangles: human.mesh.triangles })
    const crateGeo = geometryReport({ vertices: crate.mesh.vertices, triangles: crate.mesh.triangles })
    const crossing = geometryReport(crossingFixture())
    const anatomy = anatomyReport('humano')
    const dThesis = this.thesis.evaluate({
      objective: 'Criticar geometria e anatomia do corpus sem reivindicar visão',
      constraints: ['CPU only', 'não reivindicar captura'],
      resources: ['mesh', 'rig'],
      priorities: { quality: 9, performance: 6, safety: 8, cost: 5, scalability: 6 },
    })
    return {
      format: 'ues-critic-v1',
      human: humanGeo,
      crate: crateGeo,
      crossing: { intersections: crossing.intersections, valid: crossing.intersections > 0 },
      anatomy,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: crateGeo.valid && Math.abs(humanGeo.volume) > 1e-6 && crossing.intersections > 0 && anatomy.verification.valid,
        vision: false,
        scanned: false,
      },
      limitations: ['CPU geometric critics', 'Not vision/render benchmarks', 'Not scanned anatomy'],
    }
  }
}
