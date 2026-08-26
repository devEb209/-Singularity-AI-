import type { AngleConstraint, Particle, V3 } from './types.js'

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

export const angleAt = (a: Particle, b: Particle, c: Particle) => {
  const ba = sub(a.position, b.position)
  const bc = sub(c.position, b.position)
  const la = Math.hypot(...ba)
  const lc = Math.hypot(...bc)
  if (la < 1e-9 || lc < 1e-9) return 0
  return Math.acos(Math.max(-1, Math.min(1, dot(ba, bc) / (la * lc))))
}

export const applyHinge = (particles: Particle[], constraint: AngleConstraint) => {
  const a = particles.find(item => item.id === constraint.a)
  const b = particles.find(item => item.id === constraint.b)
  const c = particles.find(item => item.id === constraint.c)
  if (!a || !b || !c) return
  const current = angleAt(a, b, c)
  const error = current - constraint.rest
  if (Math.abs(error) < 1e-5) return
  const ba = sub(a.position, b.position)
  const bc = sub(c.position, b.position)
  const rotate = (point: V3, origin: V3, amount: number): V3 => {
    const rel = sub(point, origin)
    const cosine = Math.cos(amount)
    const sine = Math.sin(amount)
    return add(origin, [rel[0] * cosine - rel[1] * sine, rel[0] * sine + rel[1] * cosine, rel[2]])
  }
  const step = error * 0.35
  if (a.invMass > 0) a.position = rotate(a.position, b.position, step)
  if (c.invMass > 0) c.position = rotate(c.position, b.position, -step)
  void ba
  void bc
}
