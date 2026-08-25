import { sampleSky } from '../ues-atmosphere/sky.js'
import { add, clamp01, dot, scale, type V3 } from './vec.js'

export const diffuseIbl = (N: V3, sunDir: V3): V3 => {
  const sky = sampleSky(N, sunDir)
  const ground = 0.28 + 0.72 * clamp01(N[1] * 0.5 + 0.5)
  return scale(sky, 0.32 * ground)
}

export const specularIbl = (R: V3, roughness: number, sunDir: V3): V3 => {
  const sky = sampleSky(R, sunDir)
  const sharp = (1 - roughness) * (1 - roughness)
  const sun = Math.max(0, dot(R, sunDir)) ** (8 / Math.max(0.08, roughness * roughness))
  return add(scale(sky, 0.22 + 0.4 * sharp), scale([1, 0.97, 0.9], sun * 0.85 * sharp))
}

export const splitSumAmbient = (albedo: V3, metalness: number, N: V3, R: V3, roughness: number, sunDir: V3): V3 => {
  const irr = diffuseIbl(N, sunDir)
  const spec = specularIbl(R, roughness, sunDir)
  const kd = 1 - metalness
  return [
    albedo[0] * irr[0] * kd + spec[0] * (0.04 * kd + metalness),
    albedo[1] * irr[1] * kd + spec[1] * (0.04 * kd + metalness),
    albedo[2] * irr[2] * kd + spec[2] * (0.04 * kd + metalness),
  ]
}
