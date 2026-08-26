import type { StudioNode, V3 } from './types.js'

export type Mat4 = number[]

export const identity = (): Mat4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

export const multiply = (a: Mat4, b: Mat4): Mat4 => {
  const out = Array.from({ length: 16 }, () => 0)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]
    }
  }
  return out
}

const rotationXyz = (rx: number, ry: number, rz: number): Mat4 => {
  const cx = Math.cos(rx), sx = Math.sin(rx)
  const cy = Math.cos(ry), sy = Math.sin(ry)
  const cz = Math.cos(rz), sz = Math.sin(rz)
  const rxm: Mat4 = [1, 0, 0, 0, 0, cx, sx, 0, 0, -sx, cx, 0, 0, 0, 0, 1]
  const rym: Mat4 = [cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1]
  const rzm: Mat4 = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  return multiply(multiply(rzm, rym), rxm)
}

export const localMatrix = (node: StudioNode): Mat4 => {
  const t: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, node.translation[0], node.translation[1], node.translation[2], 1]
  const s: Mat4 = [node.scale[0], 0, 0, 0, 0, node.scale[1], 0, 0, 0, 0, node.scale[2], 0, 0, 0, 0, 1]
  return multiply(t, multiply(rotationXyz(node.rotation[0], node.rotation[1], node.rotation[2]), s))
}

export const worldMatrix = (nodes: StudioNode[], id: string): Mat4 => {
  const byId = new Map(nodes.map(node => [node.id, node]))
  const chain: StudioNode[] = []
  let current = byId.get(id)
  const seen = new Set<string>()
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    chain.unshift(current)
    current = current.parent ? byId.get(current.parent) : undefined
  }
  return chain.reduce((matrix, node) => multiply(matrix, localMatrix(node)), identity())
}

export const worldPosition = (nodes: StudioNode[], id: string): V3 => {
  const m = worldMatrix(nodes, id)
  return [m[12], m[13], m[14]]
}

export const parentsExist = (nodes: StudioNode[]) =>
  nodes.every(node => !node.parent || nodes.some(candidate => candidate.name === node.parent || candidate.id === node.parent))

export const uniqueIds = (nodes: StudioNode[]) => new Set(nodes.map(node => node.id)).size === nodes.length

export const seedScene = (): StudioNode[] => [
  { id: 'root', name: 'world', parent: null, translation: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: 'hero', name: 'hero', parent: 'root', translation: [1, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], mesh: 'humanoid', material: 'skin' },
  { id: 'hand', name: 'hand', parent: 'hero', translation: [1, 1.2, 0], rotation: [0, 0, 0], scale: [1, 1, 1], mesh: 'prop' },
  { id: 'lamp', name: 'lamp', parent: 'root', translation: [-1.4, 0, 0.6], rotation: [0, 0.3, 0], scale: [1, 1, 1], mesh: 'lantern', material: 'metal' },
]
