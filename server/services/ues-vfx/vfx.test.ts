import { describe, expect, it } from 'vitest'
import { UesVfxCore } from './core.js'
import { makeGrid, metrics, project } from './fluid.js'
import { simulateSmoke } from './smoke.js'

describe('UES CPU fluid and smoke', () => {
  it('reduces divergence after projection', () => {
    const grid = makeGrid(12)
    for (let i = 0; i < grid.u.length; i++) {
      grid.u[i] = (i % 5) - 2
      grid.v[i] = (i % 7) - 3
    }
    const before = metrics(grid).meanAbsDiv
    project(grid.n, grid.u, grid.v)
    expect(metrics(grid).meanAbsDiv).toBeLessThan(before)
  })

  it('makes injected smoke rise and stay mass-bounded', () => {
    const smoke = simulateSmoke(12, 16)
    expect(smoke.rose).toBe(true)
    expect(smoke.massStable).toBe(true)
    expect(smoke.last.mass).toBeGreaterThan(0)
    expect(new UesVfxCore().process().verification.valid).toBe(true)
  })
})
