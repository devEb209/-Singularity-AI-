export type V3 = [number, number, number]
export type V4 = [number, number, number, number]

export interface ClipVertex {
  x: number
  y: number
  z: number
  r: number
  g: number
  b: number
}

export interface Framebuffer {
  width: number
  height: number
  color: Float32Array
  depth: Float32Array
  written: number
}

export interface RasterStats {
  triangles: number
  fragments: number
  rejected: number
  occluded: number
}
