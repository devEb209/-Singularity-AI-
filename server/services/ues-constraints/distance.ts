import type { DistanceConstraint, Particle, V3 } from './types.js'

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]

export const applyDistance = (particles: Particle[], constraint: DistanceConstraint) => {
  const a = particles.find(item => item.id === constraint.a)
  const b = particles.find(item => item.id === constraint.b)
  if (!a || !b) return
  const delta = sub(b.position, a.position)
  const dist = Math.hypot(...delta)
  if (dist < 1e-9) return
  const normal = scale(delta, 1 / dist)
  const error = dist - constraint.rest
  const weight = a.invMass + b.invMass
  if (weight <= 0) return
  const correction = scale(normal, error / weight)
  if (a.invMass > 0) a.position = add(a.position, scale(correction, a.invMass))
  if (b.invMass > 0) b.position = add(b.position, scale(correction, -b.invMass))
}

export const distanceOf = (particles: Particle[], a: string, b: string) => {
  const left = particles.find(item => item.id === a)
  const right = particles.find(item => item.id === b)
  if (!left || !right) return Infinity
  return Math.hypot(...sub(right.position, left.position))
}
