import type { CcdHit, V3 } from './types.js'

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

export const sphereSphereCcd = (c0: V3, r0: number, v0: V3, c1: V3, r1: number, v1: V3, dt: number): CcdHit => {
  const r = sub(c0, c1)
  const v = sub(v0, v1)
  const R = r0 + r1
  const c = dot(r, r) - R * R
  if (c <= 0) return { hit: true, toi: 0, method: 'analytic-sphere-sphere' }
  const a = dot(v, v)
  if (a < 1e-12) return { hit: false, toi: dt, method: 'analytic-sphere-sphere' }
  const b = 2 * dot(r, v)
  const disc = b * b - 4 * a * c
  if (disc < 0) return { hit: false, toi: dt, method: 'analytic-sphere-sphere' }
  const t = (-b - Math.sqrt(disc)) / (2 * a)
  if (t >= 0 && t <= dt) return { hit: true, toi: Number(t.toFixed(6)), method: 'analytic-sphere-sphere' }
  return { hit: false, toi: dt, method: 'analytic-sphere-sphere' }
}

export const spherePlaneCcd = (center: V3, radius: number, velocity: V3, normal: V3, offset: number, dt: number): CcdHit => {
  const dist = dot(normal, center) - offset - radius
  if (dist <= 0) return { hit: true, toi: 0, method: 'analytic-sphere-plane' }
  const closing = dot(normal, velocity)
  if (closing >= -1e-12) return { hit: false, toi: dt, method: 'analytic-sphere-plane' }
  const t = -dist / closing
  if (t >= 0 && t <= dt) return { hit: true, toi: Number(t.toFixed(6)), method: 'analytic-sphere-plane' }
  return { hit: false, toi: dt, method: 'analytic-sphere-plane' }
}

export const capsulePlaneCcd = (a: V3, b: V3, radius: number, velocity: V3, normal: V3, offset: number, dt: number): CcdHit => {
  const first = spherePlaneCcd(a, radius, velocity, normal, offset, dt)
  const second = spherePlaneCcd(b, radius, velocity, normal, offset, dt)
  if (!first.hit && !second.hit) return { hit: false, toi: dt, method: 'analytic-capsule-plane' }
  const toi = Math.min(first.hit ? first.toi : dt, second.hit ? second.toi : dt)
  return { hit: true, toi, method: 'analytic-capsule-plane' }
}

const cosineHits = (center: number, radius: number, bound: number, omega: number, phase: number, dt: number) => {
  if (Math.abs(omega) < 1e-9 || Math.abs(bound - center) > radius + 1e-9) return []
  const arg = Math.max(-1, Math.min(1, (bound - center) / Math.max(radius, 1e-9)))
  const base = Math.acos(arg)
  const times: number[] = []
  for (const root of [base, -base]) {
    for (let k = -2; k <= 4; k++) {
      const t = (root + k * Math.PI * 2 - phase) / omega
      if (t >= -1e-9 && t <= dt + 1e-9) times.push(Math.max(0, Math.min(dt, t)))
    }
  }
  return times
}

export const yawVertexAabbCcd = (center: V3, local: V3, yaw0: number, omega: number, min: V3, max: V3, dt: number): CcdHit => {
  const radial = Math.hypot(local[0], local[2])
  const phase = Math.atan2(local[2], local[0]) + yaw0
  const inside = (t: number) => {
    const yaw = yaw0 + omega * t
    const x = center[0] + local[0] * Math.cos(yaw) - local[2] * Math.sin(yaw)
    const y = center[1] + local[1]
    const z = center[2] + local[0] * Math.sin(yaw) + local[2] * Math.cos(yaw)
    return x >= min[0] && x <= max[0] && y >= min[1] && y <= max[1] && z >= min[2] && z <= max[2]
  }
  if (inside(0)) return { hit: true, toi: 0, method: 'analytic-yaw-vertex-aabb' }
  const events = [
    ...cosineHits(center[0], radial, min[0], omega, phase, dt),
    ...cosineHits(center[0], radial, max[0], omega, phase, dt),
    ...cosineHits(center[2], radial, min[2], omega, phase + Math.PI / 2, dt),
    ...cosineHits(center[2], radial, max[2], omega, phase + Math.PI / 2, dt),
  ].sort((a, b) => a - b)
  for (const t of events) {
    if (inside(t) || inside(Math.min(dt, t + 1e-4))) return { hit: true, toi: Number(t.toFixed(6)), method: 'analytic-yaw-vertex-aabb' }
  }
  if (inside(dt)) return { hit: true, toi: dt, method: 'analytic-yaw-vertex-aabb' }
  return { hit: false, toi: dt, method: 'analytic-yaw-vertex-aabb' }
}

export const rotatingBoxAabbCcd = (center: V3, half: V3, yaw0: number, omega: number, min: V3, max: V3, dt: number): CcdHit => {
  const locals: V3[] = []
  for (const x of [-half[0], half[0]]) for (const y of [-half[1], half[1]]) for (const z of [-half[2], half[2]]) locals.push([x, y, z])
  let best: CcdHit = { hit: false, toi: dt, method: 'analytic-yaw-vertex-aabb' }
  for (const local of locals) {
    const hit = yawVertexAabbCcd(center, local, yaw0, omega, min, max, dt)
    if (hit.hit && (!best.hit || hit.toi < best.toi)) best = hit
  }
  return best
}
