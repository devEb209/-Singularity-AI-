import type { FluidGrid, FluidMetrics } from './types.js'

const ix = (n: number, i: number, j: number) => i + (n + 2) * j

export const makeGrid = (n = 16): FluidGrid => {
  const size = (n + 2) * (n + 2)
  return { n, u: new Float64Array(size), v: new Float64Array(size), d: new Float64Array(size) }
}

const setBounds = (n: number, b: number, x: Float64Array) => {
  for (let i = 1; i <= n; i++) {
    x[ix(n, 0, i)] = b === 1 ? -x[ix(n, 1, i)] : x[ix(n, 1, i)]
    x[ix(n, n + 1, i)] = b === 1 ? -x[ix(n, n, i)] : x[ix(n, n, i)]
    x[ix(n, i, 0)] = b === 2 ? -x[ix(n, i, 1)] : x[ix(n, i, 1)]
    x[ix(n, i, n + 1)] = b === 2 ? -x[ix(n, i, n)] : x[ix(n, i, n)]
  }
  x[ix(n, 0, 0)] = 0.5 * (x[ix(n, 1, 0)] + x[ix(n, 0, 1)])
  x[ix(n, 0, n + 1)] = 0.5 * (x[ix(n, 1, n + 1)] + x[ix(n, 0, n)])
  x[ix(n, n + 1, 0)] = 0.5 * (x[ix(n, n, 0)] + x[ix(n, n + 1, 1)])
  x[ix(n, n + 1, n + 1)] = 0.5 * (x[ix(n, n, n + 1)] + x[ix(n, n + 1, n)])
}

const linearSolve = (n: number, b: number, x: Float64Array, x0: Float64Array, a: number, c: number, iterations = 10) => {
  for (let k = 0; k < iterations; k++) {
    for (let j = 1; j <= n; j++) {
      for (let i = 1; i <= n; i++) {
        x[ix(n, i, j)] = (x0[ix(n, i, j)] + a * (x[ix(n, i - 1, j)] + x[ix(n, i + 1, j)] + x[ix(n, i, j - 1)] + x[ix(n, i, j + 1)])) / c
      }
    }
    setBounds(n, b, x)
  }
}

const diffuse = (n: number, b: number, x: Float64Array, x0: Float64Array, diff: number, dt: number) => {
  const a = dt * diff * n * n
  linearSolve(n, b, x, x0, a, 1 + 4 * a)
}

const advect = (n: number, b: number, d: Float64Array, d0: Float64Array, u: Float64Array, v: Float64Array, dt: number) => {
  const dt0 = dt * n
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= n; i++) {
      let x = i - dt0 * u[ix(n, i, j)]
      let y = j - dt0 * v[ix(n, i, j)]
      if (x < 0.5) x = 0.5
      if (x > n + 0.5) x = n + 0.5
      if (y < 0.5) y = 0.5
      if (y > n + 0.5) y = n + 0.5
      const i0 = Math.floor(x)
      const i1 = i0 + 1
      const j0 = Math.floor(y)
      const j1 = j0 + 1
      const s1 = x - i0
      const s0 = 1 - s1
      const t1 = y - j0
      const t0 = 1 - t1
      d[ix(n, i, j)] = s0 * (t0 * d0[ix(n, i0, j0)] + t1 * d0[ix(n, i0, j1)]) + s1 * (t0 * d0[ix(n, i1, j0)] + t1 * d0[ix(n, i1, j1)])
    }
  }
  setBounds(n, b, d)
}

export const project = (n: number, u: Float64Array, v: Float64Array) => {
  const div = new Float64Array(u.length)
  const p = new Float64Array(u.length)
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= n; i++) {
      div[ix(n, i, j)] = -0.5 * (u[ix(n, i + 1, j)] - u[ix(n, i - 1, j)] + v[ix(n, i, j + 1)] - v[ix(n, i, j - 1)]) / n
      p[ix(n, i, j)] = 0
    }
  }
  setBounds(n, 0, div)
  setBounds(n, 0, p)
  linearSolve(n, 0, p, div, 1, 4)
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= n; i++) {
      u[ix(n, i, j)] -= 0.5 * n * (p[ix(n, i + 1, j)] - p[ix(n, i - 1, j)])
      v[ix(n, i, j)] -= 0.5 * n * (p[ix(n, i, j + 1)] - p[ix(n, i, j - 1)])
    }
  }
  setBounds(n, 1, u)
  setBounds(n, 2, v)
}

export const addSource = (n: number, dest: Float64Array, source: Float64Array, dt: number) => {
  for (let i = 0; i < dest.length; i++) dest[i] += source[i] * dt
}

export const velocityStep = (grid: FluidGrid, u0: Float64Array, v0: Float64Array, visc: number, dt: number) => {
  addSource(grid.n, grid.u, u0, dt)
  addSource(grid.n, grid.v, v0, dt)
  const uPrev = Float64Array.from(grid.u)
  const vPrev = Float64Array.from(grid.v)
  diffuse(grid.n, 1, grid.u, uPrev, visc, dt)
  diffuse(grid.n, 2, grid.v, vPrev, visc, dt)
  project(grid.n, grid.u, grid.v)
  const uMid = Float64Array.from(grid.u)
  const vMid = Float64Array.from(grid.v)
  advect(grid.n, 1, grid.u, uMid, uMid, vMid, dt)
  advect(grid.n, 2, grid.v, vMid, uMid, vMid, dt)
  project(grid.n, grid.u, grid.v)
}

export const densityStep = (grid: FluidGrid, d0: Float64Array, diff: number, dt: number) => {
  addSource(grid.n, grid.d, d0, dt)
  const prev = Float64Array.from(grid.d)
  diffuse(grid.n, 0, grid.d, prev, diff, dt)
  const mid = Float64Array.from(grid.d)
  advect(grid.n, 0, grid.d, mid, grid.u, grid.v, dt)
}

export const metrics = (grid: FluidGrid): FluidMetrics => {
  const n = grid.n
  let mass = 0
  let moment = 0
  let div = 0
  let cells = 0
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= n; i++) {
      const density = grid.d[ix(n, i, j)]
      mass += density
      moment += density * j
      div += Math.abs(grid.u[ix(n, i + 1, j)] - grid.u[ix(n, i - 1, j)] + grid.v[ix(n, i, j + 1)] - grid.v[ix(n, i, j - 1)])
      cells += 1
    }
  }
  return { mass, meanAbsDiv: div / Math.max(1, cells), comY: mass > 1e-9 ? moment / mass : 0 }
}

export const inject = (n: number, field: Float64Array, x: number, y: number, amount: number, radius = 1) => {
  for (let j = y - radius; j <= y + radius; j++) {
    for (let i = x - radius; i <= x + radius; i++) {
      if (i < 1 || j < 1 || i > n || j > n) continue
      field[ix(n, i, j)] += amount
    }
  }
}
