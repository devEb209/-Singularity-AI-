import { describe, expect, it } from 'vitest'
import { UesConstraintsCore } from './core.js'
import { applyDistance, distanceOf } from './distance.js'
import { angleAt, applyHinge } from './hinge.js'
import { energy } from './spring.js'
import { solve, verlet } from './solver.js'
import type { Particle } from './types.js'

const p = (id: string, x: number, y: number, inv = 1): Particle => ({ id, position: [x, y, 0], prev: [x, y, 0], invMass: inv })

describe('UES constraint solver', () => {
  it('shortens a stretched distance constraint', () => {
    const bodies = [p('a', 0, 0), p('b', 2, 0)]
    applyDistance(bodies, { kind: 'distance', a: 'a', b: 'b', rest: 1 })
    expect(distanceOf(bodies, 'a', 'b')).toBeLessThan(1.6)
    expect(distanceOf(bodies, 'a', 'b')).toBeGreaterThan(0.8)
  })

  it('opens a hinge toward the rest angle and damps a spring', () => {
    const hinge = [p('a', 1, 0), p('b', 0, 0, 0), p('c', 0.3, 0.04)]
    const before = angleAt(hinge[0], hinge[1], hinge[2])
    applyHinge(hinge, { kind: 'hinge', a: 'a', b: 'b', c: 'c', rest: Math.PI / 2 })
    expect(Math.abs(angleAt(hinge[0], hinge[1], hinge[2]) - Math.PI / 2)).toBeLessThan(Math.abs(before - Math.PI / 2))
    const springBodies = [p('anchor', 0, 0, 0), p('mass', 2.4, 0)]
    const spring = { a: 'anchor', b: 'mass', rest: 1, stiffness: 6, damping: 8 }
    const first = energy(springBodies, [spring], 1 / 30).total
    for (let i = 0; i < 30; i++) {
      verlet(springBodies, 1 / 30)
      solve(springBodies, [], [], [spring], 4, 1 / 30)
    }
    expect(energy(springBodies, [spring], 1 / 30).total).toBeLessThan(first)
    expect(new UesConstraintsCore().process().verification.valid).toBe(true)
  })
})
