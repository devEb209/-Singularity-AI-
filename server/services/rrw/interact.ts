import { contains } from './geometry.js'
import type { RealityNode, RealityRelation } from './types.js'

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

export const distanceBetween = (a: RealityNode, b: RealityNode) => {
  const left = center(a)
  const right = center(b)
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2])
}

export const grasp = (human: RealityNode, tool: RealityNode) => {
  const reach = distanceBetween(human, tool) < 1.2
  return {
    kind: 'grasp' as const,
    possible: reach,
    relation: reach ? { from: tool.id, to: human.id, kind: 'held-by' as const } : undefined,
  }
}

export const collide = (a: RealityNode, b: RealityNode) => {
  const point = center(b)
  return { kind: 'collide' as const, hit: contains(a.extent, point) || distanceBetween(a, b) < 0.4 }
}

export const interactWorld = (nodes: RealityNode[], relations: RealityRelation[]) => {
  const human = nodes.find(item => item.id === 'human')
  const tool = nodes.find(item => item.id === 'tool')
  const eye = nodes.find(item => item.id === 'eye')
  const ocean = nodes.find(item => item.id === 'ocean')
  const held = human && tool ? grasp(human, tool) : { kind: 'grasp' as const, possible: false, relation: undefined }
  const next = held.relation && !relations.some(item => item.from === held.relation!.from && item.to === held.relation!.to)
    ? [...relations, held.relation]
    : relations
  return {
    grasp: held,
    observeOcean: Boolean(eye && ocean),
    relations: next,
    traditionalGameplayLoop: false as const,
  }
}
