import { worldPosition, type Mat4 } from './graph.js'
import type { StudioNode, V3 } from './types.js'

export interface Camera {
  eye: V3
  target: V3
  fov: number
  aspect: number
}

export const project = (point: V3, camera: Camera): [number, number, number] => {
  const forward: V3 = [camera.target[0] - camera.eye[0], camera.target[1] - camera.eye[1], camera.target[2] - camera.eye[2]]
  const fl = Math.hypot(...forward) || 1
  const f: V3 = [forward[0] / fl, forward[1] / fl, forward[2] / fl]
  const rel: V3 = [point[0] - camera.eye[0], point[1] - camera.eye[1], point[2] - camera.eye[2]]
  const z = rel[0] * f[0] + rel[1] * f[1] + rel[2] * f[2]
  const tan = Math.tan(camera.fov * 0.5)
  return [rel[0] / Math.max(0.05, z * tan * camera.aspect), rel[1] / Math.max(0.05, z * tan), z]
}

export const pickNode = (nodes: StudioNode[], camera: Camera, ndc: [number, number]) => {
  let best: { id: string; dist: number } | undefined
  for (const node of nodes) {
    const [x, y, z] = project(worldPosition(nodes, node.id), camera)
    if (z <= 0.05) continue
    const dist = Math.hypot(x - ndc[0], y - ndc[1])
    if (!best || dist < best.dist) best = { id: node.id, dist }
  }
  return best
}

export type { Mat4 }
