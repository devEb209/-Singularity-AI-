import type { CcdHit, V3 } from './types.js'

export interface Obb {
  center: V3
  half: V3
  yaw: number
}

const rot = (yaw: number, local: V3): V3 => [
  local[0] * Math.cos(yaw) - local[2] * Math.sin(yaw),
  local[1],
  local[0] * Math.sin(yaw) + local[2] * Math.cos(yaw),
]

export const obbAxes = (yaw: number): [V3, V3, V3] => [
  rot(yaw, [1, 0, 0]),
  [0, 1, 0],
  rot(yaw, [0, 0, 1]),
]

const project = (obb: Obb, axis: V3) => {
  const axes = obbAxes(obb.yaw)
  const center = obb.center[0] * axis[0] + obb.center[1] * axis[1] + obb.center[2] * axis[2]
  const radius = obb.half[0] * Math.abs(axes[0][0] * axis[0] + axes[0][1] * axis[1] + axes[0][2] * axis[2])
    + obb.half[1] * Math.abs(axes[1][0] * axis[0] + axes[1][1] * axis[1] + axes[1][2] * axis[2])
    + obb.half[2] * Math.abs(axes[2][0] * axis[0] + axes[2][1] * axis[1] + axes[2][2] * axis[2])
  return { min: center - radius, max: center + radius }
}

const overlap1d = (a: { min: number; max: number }, b: { min: number; max: number }) => a.max >= b.min && b.max >= a.min

const cross = (u: V3, v: V3): V3 => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]

export const obbOverlap = (a: Obb, b: Obb) => {
  const aAxes = obbAxes(a.yaw)
  const bAxes = obbAxes(b.yaw)
  const axes: V3[] = [...aAxes, ...bAxes]
  for (const u of aAxes) {
    for (const v of bAxes) {
      const w = cross(u, v)
      if (w[0] * w[0] + w[1] * w[1] + w[2] * w[2] > 1e-10) axes.push(w)
    }
  }
  return axes.every(axis => overlap1d(project(a, axis), project(b, axis)))
}

export const obbObbRotationalCcd = (a: Obb, b: Obb, omega: number, dt: number): CcdHit => {
  if (obbOverlap(a, b)) return { hit: true, toi: 0, method: 'obb-obb-sat' }
  let lo = 0
  let hi = dt
  let found = false
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    const sample = { ...a, yaw: a.yaw + omega * mid }
    if (obbOverlap(sample, b)) {
      found = true
      hi = mid
    } else lo = mid
  }
  if (found) return { hit: true, toi: Number(hi.toFixed(6)), method: 'obb-obb-rotational-sat' }
  const end = { ...a, yaw: a.yaw + omega * dt }
  if (obbOverlap(end, b)) return { hit: true, toi: dt, method: 'obb-obb-rotational-sat' }
  return { hit: false, toi: dt, method: 'obb-obb-rotational-sat' }
}
