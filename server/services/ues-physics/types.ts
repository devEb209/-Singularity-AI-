import type { V3 } from './vec.js'

export interface Convex {
  id: string
  center: V3
  support: (dir: V3) => V3
}

export interface GjkResult {
  hit: boolean
  simplex: V3[]
  iterations: number
}

export interface EpaContact {
  normal: V3
  depth: number
  iterations: number
}

export interface RigidBody {
  id: string
  velocity: V3
  sleeping: boolean
  still: number
}

export interface SweepHit {
  hit: boolean
  toi: number
  method: 'conservative-sampled-rotation'
}
