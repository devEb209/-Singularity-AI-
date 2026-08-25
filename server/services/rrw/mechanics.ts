import { contains } from './geometry.js'
import { centerOf, distanceBetween, geometricMass } from './extent.js'
import type { RealityNode } from './types.js'

export const contact = (a: RealityNode, b: RealityNode) => {
  const point = centerOf(b)
  const overlap = contains(a.extent, point) || distanceBetween(a, b) < 0.4
  return {
    hit: overlap,
    distance: distanceBetween(a, b),
    rigidbodyAsset: false as const,
  }
}

export const momentumOf = (node: RealityNode, velocity: [number, number, number]): [number, number, number] => {
  const mass = Math.max(1e-6, geometricMass(node))
  return [mass * velocity[0], mass * velocity[1], mass * velocity[2]]
}

export const elastic1d = (m1: number, v1: number, m2: number, v2: number) => {
  const u1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
  const u2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
  return { u1, u2, conserved: Math.abs((m1 * v1 + m2 * v2) - (m1 * u1 + m2 * u2)) < 1e-9 }
}

export const graspReach = (human: RealityNode, tool: RealityNode) => distanceBetween(human, tool) < 1.2
