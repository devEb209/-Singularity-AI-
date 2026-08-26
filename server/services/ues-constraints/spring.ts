import type { Particle, SpringForce, V3 } from './types.js'

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

export const applySpring = (particles: Particle[], spring: SpringForce, dt: number) => {
  const a = particles.find(item => item.id === spring.a)
  const b = particles.find(item => item.id === spring.b)
  if (!a || !b) return
  const delta = sub(b.position, a.position)
  const dist = Math.hypot(...delta)
  if (dist < 1e-9) return
  const normal = scale(delta, 1 / dist)
  const weight = a.invMass + b.invMass
  if (weight <= 0) return
  const stretch = Math.min(1, Math.max(0.05, spring.stiffness * dt))
  const correction = scale(normal, (dist - spring.rest) * stretch / weight)
  if (a.invMass > 0) a.position = add(a.position, scale(correction, a.invMass))
  if (b.invMass > 0) b.position = add(b.position, scale(correction, -b.invMass))
  const va = sub(a.position, a.prev)
  const vb = sub(b.position, b.prev)
  const rel = dot(sub(vb, va), normal)
  const damp = rel * Math.min(0.85, Math.max(0, spring.damping * dt))
  if (a.invMass > 0) a.position = add(a.position, scale(normal, damp * a.invMass / weight))
  if (b.invMass > 0) b.position = add(b.position, scale(normal, -damp * b.invMass / weight))
}

export const energy = (particles: Particle[], springs: SpringForce[], dt: number) => {
  let kinetic = 0
  let potential = 0
  for (const particle of particles) {
    if (particle.invMass <= 0) continue
    const vel = scale(sub(particle.position, particle.prev), 1 / Math.max(dt, 1e-6))
    kinetic += 0.5 * (1 / particle.invMass) * dot(vel, vel)
  }
  for (const spring of springs) {
    const a = particles.find(item => item.id === spring.a)
    const b = particles.find(item => item.id === spring.b)
    if (!a || !b) continue
    const stretch = Math.hypot(...sub(b.position, a.position)) - spring.rest
    potential += 0.5 * spring.stiffness * stretch * stretch
  }
  return { kinetic, potential, total: kinetic + potential }
}
