export type RepresentationKind = 'full' | 'simplified' | 'dormant' | 'reconstructable' | 'procedural' | 'instanced'
export type HardwareTier = 'low' | 'balanced' | 'high'
export type DomainKind = 'world' | 'geometry' | 'physics' | 'npc' | 'material' | 'particle' | 'audio' | 'motion' | 'graphics'

export interface RepresentationNeed {
  domain: DomainKind
  influence: number
  distance: number
  visible: boolean
  interactive: boolean
  reconstructable: boolean
}

export interface RepresentationChoice {
  domain: DomainKind
  kind: RepresentationKind
  resident: boolean
  simulate: boolean
  render: boolean
  store: boolean
  reason: string
}
