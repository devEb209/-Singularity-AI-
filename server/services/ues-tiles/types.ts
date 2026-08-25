export type Vec3 = [number, number, number]

export interface TileBox {
  center: Vec3
  ux: Vec3
  uy: Vec3
  uz: Vec3
}

export interface TileSphere {
  center: Vec3
  radius: number
}

export interface TileRegion {
  west: number
  south: number
  east: number
  north: number
  minHeight: number
  maxHeight: number
}

export type BoundingVolume =
  | { kind: 'box'; box: TileBox }
  | { kind: 'sphere'; sphere: TileSphere }
  | { kind: 'region'; region: TileRegion }

export type Refine = 'ADD' | 'REPLACE'

export interface TileContent {
  uri: string
}

export interface TileNode {
  id: string
  boundingVolume: BoundingVolume
  geometricError: number
  refine: Refine
  content?: TileContent
  children: TileNode[]
  transform?: number[]
}

export interface Tileset {
  asset: { version: '1.1'; generator: 'ues-tiles' }
  geometricError: number
  root: TileNode
  cesiumRequired: false
}

export interface Camera {
  position: Vec3
  forward: Vec3
  up: Vec3
  fovY: number
  aspect: number
  near: number
  far: number
  viewportHeight: number
}

export interface SelectedTile {
  id: string
  uri?: string
  sse: number
  distance: number
  fidelity: 'full' | 'simplified' | 'dormant'
}

export interface Plane {
  normal: Vec3
  constant: number
}
