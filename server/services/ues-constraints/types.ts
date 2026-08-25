export type V3 = [number, number, number]

export interface Particle {
  id: string
  position: V3
  prev: V3
  invMass: number
}

export interface DistanceConstraint {
  kind: 'distance'
  a: string
  b: string
  rest: number
}

export interface AngleConstraint {
  kind: 'hinge'
  a: string
  b: string
  c: string
  rest: number
}

export interface SpringForce {
  a: string
  b: string
  rest: number
  stiffness: number
  damping: number
}
