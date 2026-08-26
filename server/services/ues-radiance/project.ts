import type { Camera } from './camera.js'
import { transformClip, transformView } from './camera.js'
import type { WorldVertex } from './mesh.js'

export interface ClipVertex {
  x: number
  y: number
  z: number
  invW: number
  wx: number
  wy: number
  wz: number
  nx: number
  ny: number
  nz: number
  u: number
  v: number
  material: number
}

export const projectVertex = (vertex: WorldVertex, camera: Camera, width: number, height: number): ClipVertex | null => {
  const view = transformView(camera.view, vertex.p)
  const clip = transformClip(camera.proj, view)
  if (clip[3] <= 1e-4) return null
  const invW = 1 / clip[3]
  const ndcX = clip[0] * invW
  const ndcY = clip[1] * invW
  const ndcZ = clip[2] * invW
  return {
    x: (ndcX * 0.5 + 0.5) * width,
    y: (1 - (ndcY * 0.5 + 0.5)) * height,
    z: ndcZ * 0.5 + 0.5,
    invW,
    wx: vertex.p[0] * invW,
    wy: vertex.p[1] * invW,
    wz: vertex.p[2] * invW,
    nx: vertex.n[0] * invW,
    ny: vertex.n[1] * invW,
    nz: vertex.n[2] * invW,
    u: vertex.uv[0] * invW,
    v: vertex.uv[1] * invW,
    material: vertex.material,
  }
}
