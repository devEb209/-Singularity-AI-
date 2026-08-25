import { add, clamp01, dot, mix, scale, type V3 } from '../ues-light/vec.js'

export const sampleSky = (dir: V3, sunDir: V3): V3 => {
  const up = clamp01(dir[1] * 0.5 + 0.5)
  const zenith: V3 = [0.12, 0.28, 0.68]
  const horizon: V3 = [0.74, 0.8, 0.9]
  const ground: V3 = [0.22, 0.2, 0.16]
  const base = dir[1] < 0 ? mix(horizon, ground, clamp01(-dir[1] * 1.6)) : mix(horizon, zenith, up * up)
  const sun = Math.max(0, dot(dir, sunDir))
  const disc = sun > 0.997 ? (sun - 0.997) / 0.003 : 0
  const haze = sun ** 8
  return add(add(base, scale([1, 0.86, 0.55], haze * 0.28)), scale([1, 0.95, 0.82], disc * 6))
}

export const cameraRay = (forward: V3, right: V3, up: V3, ndcX: number, ndcY: number, tanHalf: number, aspect: number): V3 => {
  const x = ndcX * tanHalf * aspect
  const y = ndcY * tanHalf
  const ray: V3 = [
    right[0] * x + up[0] * y + forward[0],
    right[1] * x + up[1] * y + forward[1],
    right[2] * x + up[2] * y + forward[2],
  ]
  const len = Math.hypot(ray[0], ray[1], ray[2]) || 1
  return [ray[0] / len, ray[1] / len, ray[2] / len]
}
