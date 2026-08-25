import { requireSubstance } from './substances.js'
import type { RealityNode } from './types.js'

const G = 6.6743e-11

const massOf = (node: RealityNode) => {
  if (!node.substanceId) return 0
  const substance = requireSubstance(node.substanceId)
  if (node.extent.kind === 'sphere' && node.extent.radius) {
    return (4 / 3) * Math.PI * node.extent.radius ** 3 * substance.density
  }
  if (node.extent.kind === 'box' && node.extent.min && node.extent.max) {
    const dx = node.extent.max[0] - node.extent.min[0]
    const dy = node.extent.max[1] - node.extent.min[1]
    const dz = node.extent.max[2] - node.extent.min[2]
    return Math.abs(dx * dy * dz) * substance.density
  }
  return substance.density
}

const centerOf = (node: RealityNode): [number, number, number] => {
  if (node.extent.center) return node.extent.center
  if (node.extent.min && node.extent.max) {
    return [
      (node.extent.min[0] + node.extent.max[0]) / 2,
      (node.extent.min[1] + node.extent.max[1]) / 2,
      (node.extent.min[2] + node.extent.max[2]) / 2,
    ]
  }
  return [0, 0, 0]
}

export const potentialAt = (nodes: RealityNode[], point: [number, number, number]) =>
  nodes.reduce((sum, node) => {
    const mass = massOf(node)
    if (mass <= 0) return sum
    const c = centerOf(node)
    const r = Math.hypot(point[0] - c[0], point[1] - c[1], point[2] - c[2]) || 1
    return sum - G * mass / r
  }, 0)

export const accelerationAt = (nodes: RealityNode[], point: [number, number, number]) => {
  const acc: [number, number, number] = [0, 0, 0]
  for (const node of nodes) {
    const mass = massOf(node)
    if (mass <= 0) continue
    const c = centerOf(node)
    const dx = c[0] - point[0]
    const dy = c[1] - point[1]
    const dz = c[2] - point[2]
    const r2 = dx * dx + dy * dy + dz * dz || 1
    const scale = G * mass / (r2 * Math.sqrt(r2))
    acc[0] += dx * scale
    acc[1] += dy * scale
    acc[2] += dz * scale
  }
  return acc
}
