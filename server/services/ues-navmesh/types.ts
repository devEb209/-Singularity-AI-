export type V3 = [number, number, number]
export type V2 = [number, number]
export type Tri = [number, number, number]

export interface Mesh {
  vertices: V3[]
  triangles: Tri[]
}

export interface VoxelGrid {
  origin: V3
  cell: number
  dim: [number, number, number]
  occupied: Uint8Array
}

export interface Portal {
  left: V2
  right: V2
}
