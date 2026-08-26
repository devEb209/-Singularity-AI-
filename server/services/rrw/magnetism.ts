import { centerOf } from './extent.js'
import type { RealityNode } from './types.js'

const MU0_4PI = 1e-7

export const momentOf = (node: RealityNode): [number, number, number] => {
  if (node.magneticMoment) return node.magneticMoment
  if (node.substanceId === 'Fe') return [0, 2.2, 0]
  return [0, 0, 0]
}

export const magneticFieldAt = (nodes: RealityNode[], point: [number, number, number]) => {
  const field: [number, number, number] = [0, 0, 0]
  for (const node of nodes) {
    const m = momentOf(node)
    if (m[0] === 0 && m[1] === 0 && m[2] === 0) continue
    const c = centerOf(node)
    const r: [number, number, number] = [point[0] - c[0], point[1] - c[1], point[2] - c[2]]
    const r2 = r[0] * r[0] + r[1] * r[1] + r[2] * r[2] || 1
    const r1 = Math.sqrt(r2)
    const mdotr = m[0] * r[0] + m[1] * r[1] + m[2] * r[2]
    const scale = MU0_4PI / (r2 * r1)
    field[0] += scale * (3 * mdotr * r[0] / r2 - m[0])
    field[1] += scale * (3 * mdotr * r[1] / r2 - m[1])
    field[2] += scale * (3 * mdotr * r[2] / r2 - m[2])
  }
  return field
}

export const magneticStrength = (field: [number, number, number]) => Math.hypot(field[0], field[1], field[2])

export const compareMagnet = (nodes: RealityNode[]) => {
  const tool = nodes.find(item => item.id === 'tool') ?? nodes.find(item => item.substanceId === 'Fe')
  if (!tool) return { near: 0, far: 0, strongerNear: false, lodestoneAsset: false as const }
  const c = centerOf(tool)
  const near = magneticStrength(magneticFieldAt(nodes, [c[0], c[1] + 0.2, c[2]]))
  const far = magneticStrength(magneticFieldAt(nodes, [c[0], c[1] + 20, c[2]]))
  return { near, far, strongerNear: near > far, lodestoneAsset: false as const }
}
