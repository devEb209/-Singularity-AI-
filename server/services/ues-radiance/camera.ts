import { cross, dot, norm, sub, type Mat4, type V3 } from '../ues-light/vec.js'

export interface Camera {
  eye: V3
  target: V3
  up: V3
  fovY: number
  aspect: number
  near: number
  far: number
  view: Mat4
  proj: Mat4
  forward: V3
  right: V3
  camUp: V3
}

export const lookAt = (eye: V3, target: V3, up: V3): { view: Mat4; forward: V3; right: V3; camUp: V3 } => {
  const z = norm(sub(eye, target))
  const x = norm(cross(up, z))
  const y = cross(z, x)
  const view: Mat4 = [
    x[0], x[1], x[2], -dot(x, eye),
    y[0], y[1], y[2], -dot(y, eye),
    z[0], z[1], z[2], -dot(z, eye),
    0, 0, 0, 1,
  ]
  return { view, forward: [-z[0], -z[1], -z[2]], right: x, camUp: y }
}

export const perspective = (fovY: number, aspect: number, near: number, far: number): Mat4 => {
  const f = 1 / Math.tan(fovY / 2)
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), (2 * far * near) / (near - far),
    0, 0, -1, 0,
  ]
}

export const createCamera = (width: number, height: number): Camera => {
  const eye: V3 = [0, 1.55, 4.35]
  const target: V3 = [0, 0.42, 0]
  const oriented = lookAt(eye, target, [0, 1, 0])
  const aspect = width / height
  return {
    eye,
    target,
    up: [0, 1, 0],
    fovY: Math.PI / 4,
    aspect,
    near: 0.12,
    far: 18,
    view: oriented.view,
    proj: perspective(Math.PI / 4, aspect, 0.12, 18),
    forward: oriented.forward,
    right: oriented.right,
    camUp: oriented.camUp,
  }
}

export const transformView = (view: Mat4, p: V3): V3 => [
  view[0] * p[0] + view[1] * p[1] + view[2] * p[2] + view[3],
  view[4] * p[0] + view[5] * p[1] + view[6] * p[2] + view[7],
  view[8] * p[0] + view[9] * p[1] + view[10] * p[2] + view[11],
]

export const transformClip = (proj: Mat4, p: V3): [number, number, number, number] => [
  proj[0] * p[0] + proj[1] * p[1] + proj[2] * p[2] + proj[3],
  proj[4] * p[0] + proj[5] * p[1] + proj[6] * p[2] + proj[7],
  proj[8] * p[0] + proj[9] * p[1] + proj[10] * p[2] + proj[11],
  proj[12] * p[0] + proj[13] * p[1] + proj[14] * p[2] + proj[15],
]
