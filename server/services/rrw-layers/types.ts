import type { RealityDescription } from '../rrw/types.js'

export type LayerId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29

export type TransversalId =
  | 'entity'
  | 'property'
  | 'relation'
  | 'interaction'
  | 'causality'
  | 'time'
  | 'space'
  | 'energy'
  | 'information'
  | 'emergence'
  | 'evolution'
  | 'law'
  | 'persistence'
  | 'multiscale'
  | 'resolution'
  | 'visualization'
  | 'observation'
  | 'replay'
  | 'analysis'
  | 'integration'

export interface LayerSpec {
  id: LayerId
  key: string
  name: string
  topics: string[]
  typicalDescription: RealityDescription
  existing: string[]
  do15MayAbstract: true
  do15MayDelete: false
  consciousnessClaim: false
}

export interface LayerEntity {
  id: string
  layer: LayerId
  label: string
  kind: string
  properties: Record<string, number | string | boolean>
  description: RealityDescription
  inferred: boolean
  consciousnessClaim: false
}

export interface LayerLink {
  from: string
  to: string
  kind: 'emerges-from' | 'constrains' | 'exchanges' | 'observes' | 'causes'
  bidirectional: boolean
}

export interface ConstructionClock {
  tick: number
  speed: number
  paused: boolean
  layerFocus: LayerId
}
