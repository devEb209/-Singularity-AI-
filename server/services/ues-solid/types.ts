export type V3 = [number, number, number]
export type Tri = [number, number, number]

export type CsgOp = 'union' | 'subtract' | 'intersect'

export interface SolidPrimitive {
  id: string
  kind: 'box' | 'sphere' | 'cylinder'
  center: V3
  radius: V3
}

export interface SolidMesh {
  vertices: V3[]
  triangles: Tri[]
}

export interface Occupancy {
  origin: V3
  cell: number
  dim: number
  occupied: Uint8Array
  count: number
}
