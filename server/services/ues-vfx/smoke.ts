import { densityStep, inject, makeGrid, metrics, velocityStep } from './fluid.js'

export const simulateSmoke = (steps = 16, n = 16) => {
  const grid = makeGrid(n)
  const history = []
  for (let step = 0; step < steps; step++) {
    const d0 = new Float64Array(grid.d.length)
    const u0 = new Float64Array(grid.u.length)
    const v0 = new Float64Array(grid.v.length)
    inject(n, d0, Math.floor(n / 2), 2, 80, 1)
    inject(n, v0, Math.floor(n / 2), 2, 18, 1)
    for (let j = 1; j <= n; j++) {
      for (let i = 1; i <= n; i++) {
        const idx = i + (n + 2) * j
        v0[idx] += grid.d[idx] * 4
      }
    }
    velocityStep(grid, u0, v0, 0.0001, 0.1)
    densityStep(grid, d0, 0.0001, 0.1)
    history.push(metrics(grid))
  }
  const first = history[0]
  const last = history[history.length - 1]
  return {
    format: 'ues-vfx-smoke-v1',
    n,
    steps,
    first,
    last,
    rose: last.comY > first.comY,
    massStable: last.mass > 0 && last.mass < first.mass * 20,
    shader: false,
    sph: false,
  }
}
