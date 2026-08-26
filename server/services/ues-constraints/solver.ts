import { applyDistance } from './distance.js'
import { applyHinge } from './hinge.js'
import { applySpring } from './spring.js'
import type { AngleConstraint, DistanceConstraint, Particle, SpringForce, V3 } from './types.js'

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]

export const verlet = (particles: Particle[], dt: number, gravity: V3 = [0, 0, 0]) => {
  for (const particle of particles) {
    if (particle.invMass <= 0) continue
    const velocity = sub(particle.position, particle.prev)
    const next = add(add(particle.position, velocity), scale(gravity, dt * dt))
    particle.prev = particle.position
    particle.position = next
  }
}

export const solve = (
  particles: Particle[],
  distances: DistanceConstraint[],
  hinges: AngleConstraint[],
  springs: SpringForce[],
  iterations = 8,
  dt = 1 / 30,
) => {
  for (const spring of springs) applySpring(particles, spring, dt)
  for (let i = 0; i < iterations; i++) {
    for (const constraint of distances) applyDistance(particles, constraint)
    for (const constraint of hinges) applyHinge(particles, constraint)
  }
  return particles
}

export const cloneParticles = (particles: Particle[]): Particle[] =>
  particles.map(item => ({ id: item.id, position: [...item.position] as V3, prev: [...item.prev] as V3, invMass: item.invMass }))
