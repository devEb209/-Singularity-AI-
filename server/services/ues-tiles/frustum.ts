import { volumeSphere } from './bounds.js'
import type { BoundingVolume, Camera, Plane, Vec3 } from './types.js'

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: Vec3): Vec3 => {
  const len = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / len, a[1] / len, a[2] / len]
}

const planeFrom = (normal: Vec3, point: Vec3): Plane => {
  const n = norm(normal)
  return { normal: n, constant: -dot(n, point) }
}

export const cameraPlanes = (camera: Camera): Plane[] => {
  const forward = norm(camera.forward)
  const right = norm(cross(forward, camera.up))
  const up = norm(cross(right, forward))
  const tanY = Math.tan((camera.fovY * Math.PI) / 360)
  const tanX = tanY * camera.aspect
  const nearCenter = add(camera.position, scale(forward, camera.near))
  const farCenter = add(camera.position, scale(forward, camera.far))
  const near = planeFrom(forward, nearCenter)
  const far = planeFrom(scale(forward, -1), farCenter)
  const left = planeFrom(cross(add(forward, scale(right, tanX)), up), camera.position)
  const rightP = planeFrom(cross(up, add(forward, scale(right, -tanX))), camera.position)
  const bottom = planeFrom(cross(right, add(forward, scale(up, tanY))), camera.position)
  const top = planeFrom(cross(add(forward, scale(up, -tanY)), right), camera.position)
  return [near, far, left, rightP, bottom, top]
}

export const sphereInFrustum = (center: Vec3, radius: number, planes: Plane[]) =>
  planes.every(plane => dot(plane.normal, center) + plane.constant >= -radius)

const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2])

export const sphereInView = (center: Vec3, radius: number, camera: Camera) => {
  const to = sub(center, camera.position)
  const dist = len(to)
  if (dist <= radius) return true
  if (dist - radius > camera.far) return false
  const forward = norm(camera.forward)
  const front = dot(forward, to)
  if (front + radius < camera.near) return false
  const angle = Math.acos(Math.min(1, Math.max(-1, front / dist)))
  const halfFov = ((camera.fovY * Math.PI) / 360) * Math.hypot(1, camera.aspect)
  const angularRadius = Math.asin(Math.min(1, radius / dist))
  return angle - angularRadius <= halfFov * 1.35
}

export const volumeVisible = (volume: BoundingVolume, camera: Camera) => {
  const sphere = volumeSphere(volume)
  return sphereInView(sphere.center, sphere.radius, camera) || sphereInFrustum(sphere.center, sphere.radius, cameraPlanes(camera))
}

export const lookAt = (eye: Vec3, target: Vec3, up: Vec3 = [0, 0, 1]): Camera => ({
  position: eye,
  forward: norm(sub(target, eye)),
  up,
  fovY: 60,
  aspect: 16 / 9,
  near: 1,
  far: 50_000_000,
  viewportHeight: 720,
})
