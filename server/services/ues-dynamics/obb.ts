import type { CcdHit, V3 } from './types.js'

export interface Obb {
  center: V3
  half: V3
  yaw: number
  pitch?: number
  roll?: number
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

const orient = (obb: Obb, local: V3): V3 => {
  const pitch = obb.pitch ?? 0
  const roll = obb.roll ?? 0
  if (pitch === 0 && roll === 0) return rot(obb.yaw, local)
  const cr = Math.cos(roll)
  const sr = Math.sin(roll)
  const y1 = local[1] * cr - local[2] * sr
  const z1 = local[1] * sr + local[2] * cr
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const x2 = local[0] * cp + z1 * sp
  const z2 = -local[0] * sp + z1 * cp
  return rot(obb.yaw, [x2, y1, z2])
}

export const obbAxesOf = (obb: Obb): [V3, V3, V3] => [
  orient(obb, [1, 0, 0]),
  orient(obb, [0, 1, 0]),
  orient(obb, [0, 0, 1]),
]

const project = (obb: Obb, axis: V3) => {
  const axes = obbAxesOf(obb)
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

export const obbObbSampledCcd = (a: Obb, b: Obb, rates: { yaw: number; pitch?: number; roll?: number }, dt: number): CcdHit => {
  if (obbOverlap(a, b)) return { hit: true, toi: 0, method: 'obb-obb-sampled-sat' }
  let lo = 0
  let hi = dt
  let found = false
  const pitchRate = rates.pitch ?? 0
  const rollRate = rates.roll ?? 0
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    const sample = {
      ...a,
      yaw: a.yaw + rates.yaw * mid,
      pitch: (a.pitch ?? 0) + pitchRate * mid,
      roll: (a.roll ?? 0) + rollRate * mid,
    }
    if (obbOverlap(sample, b)) {
      found = true
      hi = mid
    } else lo = mid
  }
  if (found) return { hit: true, toi: Number(hi.toFixed(6)), method: 'obb-obb-sampled-sat' }
  return { hit: false, toi: dt, method: 'obb-obb-sampled-sat' }
}
