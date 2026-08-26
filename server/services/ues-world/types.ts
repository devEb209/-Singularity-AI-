export type Biome = 'alpine' | 'wetland' | 'forest' | 'grassland'
export type BuildingKind = 'house' | 'market' | 'clinic' | 'workshop' | 'farm' | 'keep'

export interface Terrain {
  format: 'ues-terrain-v1'
  seed: number
  size: number
  chunkSize: number
  heights: number[][]
  biomes: Biome[][]
  slopes: number[][]
  verification: { finite: boolean; dimensions: [number, number]; slopeFinite: boolean }
}

export interface RoadGraph {
  format: 'ues-roads-v1'
  nodes: { id: string; x: number; z: number; kind: 'settlement' | 'junction' | 'gate' }[]
  edges: { from: string; to: string; cells: [number, number][]; length: number }[]
  cells: boolean[][]
  verification: { connected: boolean; nodeCount: number; edgeCount: number }
}

export interface Building {
  id: string
  kind: BuildingKind
  x: number
  z: number
  width: number
  depth: number
  floors: number
  settlementId: string
}

export interface Settlement {
  id: string
  name: string
  cx: number
  cz: number
  radius: number
  buildings: Building[]
}

export interface VegetationInstance {
  id: string
  kind: 'tree' | 'shrub' | 'reed' | 'rock'
  x: number
  z: number
  height: number
}

export interface StreamView {
  viewer: [number, number]
  radius: number
  chunkSize: number
  loaded: string[]
  unloaded: string[]
  resident: string[]
}
