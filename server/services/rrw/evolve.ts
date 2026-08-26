import { phaseAt } from './matter.js'
import { requireSubstance } from './substances.js'
import type { RealityNode } from './types.js'

const center = (node: RealityNode): [number, number, number] => {
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

export const stepReality = (nodes: RealityNode[], dt: number, ambientK = 288) => {
  const fire = nodes.find(item => item.id === 'fire')
  return nodes.map(node => {
    let temperatureK: number
    if (node.id === 'fire') temperatureK = node.temperatureK + (ambientK + 400 - node.temperatureK) * Math.min(1, dt * 0.15)
    else if (fire) {
      const a = center(node)
      const b = center(fire)
      const dist = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) || 1
      temperatureK = node.temperatureK + ((fire.temperatureK - node.temperatureK) * 0.08 * dt) / (1 + dist)
    } else temperatureK = node.temperatureK + (ambientK - node.temperatureK) * Math.min(1, dt * 0.02)
    const substance = node.substanceId ? requireSubstance(node.substanceId) : undefined
    const phase = substance ? phaseAt(substance, temperatureK) : node.phase
    return { ...node, temperatureK, phase }
  })
}
