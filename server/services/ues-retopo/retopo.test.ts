import { describe, expect, it } from 'vitest'
import { UesRetopoCore } from './core.js'
import { inspect } from './inspect.js'
import { fillHoles, weld } from './repair.js'
import type { Mesh } from './types.js'

describe('UES retopology', () => {
  it('welds coincident vertices and fills a boundary hole', () => {
    const mesh: Mesh = {
      vertices: [[0, 0, 0], [1, 0, 0], [0, 0, 1], [0.0002, 0, 0]],
      triangles: [[0, 1, 2]],
    }
    const welded = weld(mesh, 0.001)
    expect(welded.vertices.length).toBe(3)
    const open: Mesh = {
      vertices: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1], [0.5, 0, 0.5]],
      triangles: [[4, 0, 1], [4, 1, 2], [4, 2, 3]],
    }
    const before = inspect(open)
    const filled = fillHoles(open)
    expect(inspect(filled).boundaryEdges).toBeLessThan(before.boundaryEdges)
  })

  it('repairs damage and remeshes with edge-flow bias', () => {
    const result = new UesRetopoCore().process('humano')
    expect(result.verification.valid).toBe(true)
    expect(result.afterRepair.degenerateFaces).toBe(0)
    expect(result.reduction.outputVertices).toBeLessThan(result.reduction.inputVertices)
  })
})
