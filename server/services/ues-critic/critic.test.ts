import { describe, expect, it } from 'vitest'
import { catalog } from '../ues-corpus/catalog.js'
import { meshEntry } from '../ues-corpus/generate.js'
import { anatomyReport } from './anatomy.js'
import { UesCriticCore } from './core.js'
import { crossingFixture, geometryReport, trianglesIntersect } from './geometry.js'

describe('UES geometry and anatomy critics', () => {
  it('accepts a closed parametric crate and flags a crossing pair', () => {
    const crate = meshEntry(catalog.find(item => item.kind === 'crate')!, 5)
    const report = geometryReport({ vertices: crate.mesh.vertices, triangles: crate.mesh.triangles })
    expect(Math.abs(report.volume)).toBeGreaterThan(0)
    expect(report.intersections).toBe(0)
    expect(report.valid).toBe(true)
    const cross = crossingFixture()
    expect(trianglesIntersect(cross.vertices[0], cross.vertices[1], cross.vertices[2], cross.vertices[3], cross.vertices[4], cross.vertices[5])).toBe(true)
    expect(geometryReport(cross).intersections).toBeGreaterThan(0)
  })

  it('accepts contralateral symmetry on the humanoid template', () => {
    const anatomy = anatomyReport('humano')
    expect(anatomy.verification.valid).toBe(true)
    expect(anatomy.verification.scanned).toBe(false)
    expect(anatomy.pairs.every(item => item.ok)).toBe(true)
    expect(new UesCriticCore().process().verification.valid).toBe(true)
  })
})
