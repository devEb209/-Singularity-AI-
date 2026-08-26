export type V3 = [number, number, number]
export type Tri = [number, number, number]

export interface Mesh {
  vertices: V3[]
  triangles: Tri[]
}

export interface TopologyReport {
  vertexCount: number
  triangleCount: number
  unusedVertices: number
  degenerateFaces: number
  boundaryEdges: number
  nonManifoldEdges: number
  manifold: boolean
  watertight: boolean
  valid: boolean
}
