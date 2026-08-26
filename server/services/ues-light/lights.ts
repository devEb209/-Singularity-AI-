import type { LightSample, SceneLight } from './types.js'
import { clamp01, dot, length, norm, scale, sub, type V3 } from './vec.js'

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / Math.max(1e-6, edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export const defaultLights = (): SceneLight[] => [
  { kind: 'directional', dir: norm([0.55, 0.78, 0.28]), color: [1, 0.96, 0.88], intensity: 3.4, castsShadow: true },
  { kind: 'point', position: [0.15, 1.7, 1.35], color: [0.72, 0.82, 1], intensity: 2.1, radius: 3.2, castsShadow: false },
  { kind: 'spot', position: [1.6, 2.1, 1.4], dir: norm([-0.45, -0.82, -0.35]), color: [1, 0.86, 0.7], intensity: 1.6, radius: 4, inner: 0.82, outer: 0.55, castsShadow: false },
]

export const sampleLight = (light: SceneLight, world: V3): LightSample | null => {
  if (light.kind === 'directional') {
    return { L: light.dir, color: light.color, intensity: light.intensity, castsShadow: light.castsShadow }
  }
  const to = sub(light.position, world)
  const dist = length(to)
  if (dist > light.radius * 4) return null
  const L = scale(to, 1 / Math.max(dist, 1e-6))
  const atten = light.intensity / (1 + (dist * dist) / Math.max(0.25, light.radius * light.radius))
  if (light.kind === 'point') return { L, color: light.color, intensity: atten, castsShadow: light.castsShadow }
  const toward = dot(norm(sub(world, light.position)), light.dir)
  const cone = smoothstep(light.outer, light.inner, toward)
  if (cone <= 0) return null
  return { L, color: light.color, intensity: atten * cone, castsShadow: light.castsShadow }
}
