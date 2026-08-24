export type V3 = [number, number, number]

export interface StudioNode {
  id: string
  name: string
  parent: string | null
  translation: V3
  rotation: V3
  scale: V3
  mesh?: string
  material?: string
}

export interface StudioKey {
  t: number
  value: number
}

export interface StudioTrack {
  nodeId: string
  channel: 'tx' | 'ty' | 'tz' | 'rx' | 'ry' | 'rz'
  keys: StudioKey[]
}

export type StudioOp =
  | { kind: 'add'; node: StudioNode }
  | { kind: 'move'; id: string; translation: V3 }
  | { kind: 'reparent'; id: string; parent: string | null }
  | { kind: 'key'; track: StudioTrack }
  | { kind: 'delete'; id: string }

export interface StudioSnapshot {
  nodes: StudioNode[]
  tracks: StudioTrack[]
}
