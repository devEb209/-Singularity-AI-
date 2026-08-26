export type V3 = [number, number, number]
export type Tri = [number, number, number]

export interface CriticMesh {
  vertices: V3[]
  triangles: Tri[]
}

export interface GeometryReport {
  triangleCount: number
  skinny: number
  minArea: number
  maxAspect: number
  volume: number
  flippedNeighbors: number
  intersections: number
  bboxAspect: number
  valid: boolean
}
