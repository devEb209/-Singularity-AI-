import type { ChainState, Link } from './types.js'

const G = 9.81

export const defaultPendulum = (): Link[] => {
  const mass = 2
  const length = 0.8
  return [{ mass, length, com: 0.5, inertiaCom: mass * length * length / 12 }]
}

export const defaultArm = (): Link[] => [
  { mass: 2, length: 0.4, com: 0.5, inertiaCom: 2 * 0.4 * 0.4 / 12 },
  { mass: 1.2, length: 0.32, com: 0.5, inertiaCom: 1.2 * 0.32 * 0.32 / 12 },
  { mass: 0.6, length: 0.18, com: 0.5, inertiaCom: 0.6 * 0.18 * 0.18 / 12 },
]

export const rnea = (links: Link[], state: ChainState, qdd: number[], gravity = true) => {
  const n = links.length
  const omega = Array.from({ length: n }, () => 0)
  const alpha = Array.from({ length: n }, () => 0)
  const ax = Array.from({ length: n }, () => 0)
  const ay = Array.from({ length: n }, () => 0)
  const jx = Array.from({ length: n + 1 }, () => 0)
  const jy = Array.from({ length: n + 1 }, () => 0)
  if (gravity) jy[0] = G
  let abs = 0
  for (let i = 0; i < n; i++) {
    abs += state.q[i]
    omega[i] = (i === 0 ? 0 : omega[i - 1]) + state.qd[i]
    alpha[i] = (i === 0 ? 0 : alpha[i - 1]) + qdd[i]
    const lc = links[i].length * links[i].com
    const c = Math.cos(abs)
    const s = Math.sin(abs)
    ax[i] = jx[i] + alpha[i] * -lc * s - omega[i] * omega[i] * lc * c
    ay[i] = jy[i] + alpha[i] * lc * c - omega[i] * omega[i] * lc * s
    jx[i + 1] = jx[i] + alpha[i] * -links[i].length * s - omega[i] * omega[i] * links[i].length * c
    jy[i + 1] = jy[i] + alpha[i] * links[i].length * c - omega[i] * omega[i] * links[i].length * s
  }
  const tau = Array.from({ length: n }, () => 0)
  let fx = 0
  let fy = 0
  let distal = 0
  for (let i = n - 1; i >= 0; i--) {
    abs = state.q.slice(0, i + 1).reduce((sum, value) => sum + value, 0)
    const lc = links[i].length * links[i].com
    const c = Math.cos(abs)
    const s = Math.sin(abs)
    const fxCom = links[i].mass * ax[i]
    const fyCom = links[i].mass * ay[i]
    const fxJoint = fxCom + fx
    const fyJoint = fyCom + fy
    const torque = links[i].inertiaCom * alpha[i] + (lc * c * fyCom - lc * s * fxCom) + (links[i].length * c * fy - links[i].length * s * fx) + distal
    tau[i] = torque
    fx = fxJoint
    fy = fyJoint
    distal = torque
  }
  return tau
}

export const crba = (links: Link[], q: number[]) => {
  const n = links.length
  const mass = Array.from({ length: n }, () => Array.from({ length: n }, () => 0))
  const zero = Array.from({ length: n }, () => 0)
  for (let j = 0; j < n; j++) {
    const unit = zero.map((_, index) => (index === j ? 1 : 0))
    const column = rnea(links, { q, qd: zero }, unit, false)
    for (let i = 0; i < n; i++) mass[i][j] = column[i]
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const symmetric = 0.5 * (mass[i][j] + mass[j][i])
      mass[i][j] = symmetric
      mass[j][i] = symmetric
    }
  }
  return mass
}

export const solveDense = (matrix: number[][], rhs: number[]) => {
  const n = rhs.length
  const a = matrix.map((row, i) => [...row, rhs[i]])
  for (let i = 0; i < n; i++) {
    let pivot = i
    for (let r = i + 1; r < n; r++) if (Math.abs(a[r][i]) > Math.abs(a[pivot][i])) pivot = r
    if (Math.abs(a[pivot][i]) < 1e-12) throw new Error('Singular mass matrix')
    if (pivot !== i) [a[i], a[pivot]] = [a[pivot], a[i]]
    const diag = a[i][i]
    for (let c = i; c <= n; c++) a[i][c] /= diag
    for (let r = 0; r < n; r++) {
      if (r === i) continue
      const factor = a[r][i]
      for (let c = i; c <= n; c++) a[r][c] -= factor * a[i][c]
    }
  }
  return a.map(row => row[n])
}

export const forwardDynamics = (links: Link[], state: ChainState, tau: number[]) => {
  const mass = crba(links, state.q)
  const bias = rnea(links, state, Array.from({ length: links.length }, () => 0), true)
  const rhs = tau.map((value, index) => value - bias[index])
  return solveDense(mass, rhs)
}

export const pendulumClosedForm = (link: Link, q: number) => {
  const length = link.length
  const inertiaPivot = link.inertiaCom + link.mass * (length * link.com) ** 2
  return -(link.mass * G * (length * link.com) * Math.cos(q)) / inertiaPivot
}

export const massSpd = (mass: number[][]) => {
  for (let i = 0; i < mass.length; i++) {
    if (mass[i][i] <= 0) return false
    for (let j = i + 1; j < mass.length; j++) {
      if (Math.abs(mass[i][j] - mass[j][i]) > 1e-8) return false
    }
  }
  return true
}
