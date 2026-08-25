import { worldPosition } from './graph.js'
import type { StudioNode, V3 } from './types.js'

export const translateGizmo = (nodes: StudioNode[], id: string) => {
  const origin = worldPosition(nodes, id)
  const axis = (dir: V3) => ({ origin, tip: [origin[0] + dir[0], origin[1] + dir[1], origin[2] + dir[2]] as V3 })
  return { id, axes: { x: axis([1, 0, 0]), y: axis([0, 1, 0]), z: axis([0, 0, 1]) } }
}

export const applyTranslate = (nodes: StudioNode[], id: string, delta: V3): StudioNode[] =>
  nodes.map(node => node.id === id
    ? { ...node, translation: [node.translation[0] + delta[0], node.translation[1] + delta[1], node.translation[2] + delta[2]] }
    : node)
