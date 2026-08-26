import type { V3 } from './vec.js'

export interface SurfaceMaterial {
  albedo: V3
  roughness: number
  metalness: number
  ior: number
  emission: V3
}

export type LightKind = 'directional' | 'point' | 'spot'

export interface DirectionalLight {
  kind: 'directional'
  dir: V3
  color: V3
  intensity: number
  castsShadow: boolean
}

export interface PointLight {
  kind: 'point'
  position: V3
  color: V3
  intensity: number
  radius: number
  castsShadow: boolean
}

export interface SpotLight {
  kind: 'spot'
  position: V3
  dir: V3
  color: V3
  intensity: number
  radius: number
  inner: number
  outer: number
  castsShadow: boolean
}

export type SceneLight = DirectionalLight | PointLight | SpotLight

export interface LightSample {
  L: V3
  color: V3
  intensity: number
  castsShadow: boolean
}
