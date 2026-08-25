export type Phase = 'solid' | 'liquid' | 'gas' | 'plasma' | 'mixture'
export type NodeKind = 'matter' | 'field' | 'living' | 'structure' | 'phenomenon' | 'observer'
export type RealityDescription = 'law' | 'statistical' | 'continuum' | 'discrete-body' | 'spectral-transport' | 'interactive-local' | 'dormant-reconstructable'
export type DeviceClass = 'cpu' | 'ancient' | 'mobile' | 'igpu' | 'integrated' | 'dedicated'
export type SpectrumBand = 'uv' | 'violet' | 'blue' | 'green' | 'yellow' | 'red' | 'nir' | 'fir'
export type ObserverKind = 'human-photopic' | 'camera-srgb' | 'thermal-ir' | 'insect-uv'
export type ClaimState = 'KNOWN' | 'LIKELY' | 'INFERRED' | 'UNKNOWN'
export type ConservedKind = 'mass' | 'energy' | 'charge' | 'momentum'
export type FieldKind = 'gravity' | 'electric' | 'magnetic' | 'thermal' | 'pressure' | 'acoustic' | 'optical'
export type RelationKind = 'contains' | 'on' | 'surrounds' | 'held-by' | 'illuminates' | 'observes' | 'feeds' | 'exchanges' | 'orbits'
export type PhenomenonFamily = string

export const spectrumBands: SpectrumBand[] = ['uv', 'violet', 'blue', 'green', 'yellow', 'red', 'nir', 'fir']

export interface OpticalCoeffs {
  absorption: Record<SpectrumBand, number>
  scattering: Record<SpectrumBand, number>
  emission: Record<SpectrumBand, number>
}

export interface Substance {
  id: string
  formula: string
  name: string
  z?: number
  molarMass: number
  density: number
  meltK: number
  boilK: number
  phase293: Phase
  refractiveIndex: number
  specificHeat: number
  thermalConductivity: number
  electricalConductivity: number
  optical: OpticalCoeffs
  source: 'internal-reference'
}

export interface DeviceProfile {
  class: DeviceClass
  cores: number
  memoryMB: number
  presentGpu: boolean
  interactiveSlots: number
  continuumSlots: number
  spectralSlots: number
}

export interface RealityExtent {
  kind: 'sphere' | 'box' | 'implicit' | 'relation'
  center?: [number, number, number]
  radius?: number
  min?: [number, number, number]
  max?: [number, number, number]
  field?: 'plane' | 'gyroid' | 'height'
  op?: 'union' | 'subtract' | 'intersect'
  of?: string[]
}

export interface KnowledgeClaim {
  id: string
  statement: string
  state: ClaimState
  inferred: boolean
  source: string
}

export interface MixturePart {
  substanceId: string
  moles: number
}

export interface OrganismNeed {
  energy: number
  water: number
  oxygen: number
  temperatureOk: boolean
}

export interface OrganismState {
  species: string
  identity: string
  systems: { id: string; integrity: number }[]
  needs: OrganismNeed
  perception: { seen: string[]; heard: string[] }
  action: string
  consciousnessClaim: false
}

export interface RealityNode {
  id: string
  kind: NodeKind
  label: string
  substanceId?: string
  temperatureK: number
  pressurePa: number
  phase: Phase
  extent: RealityExtent
  living?: { species: string; identity: string; consciousnessClaim: false }
  emissionScale: number
  claims: KnowledgeClaim[]
  inventory?: MixturePart[]
  chargeC?: number
  magneticMoment?: [number, number, number]
  organism?: OrganismState
  domain?: string
}

export interface RealityRelation {
  from: string
  to: string
  kind: RelationKind
}

export interface Situation {
  nodeId: string
  distance: number
  relevance: number
  interacting: boolean
  visible: boolean
  phenomenon: string
  precision: number
}

export interface Adaptation {
  nodeId: string
  description: RealityDescription
  reason: string
  preset: false
  sameReality: true
}

export interface RealityDomain {
  id: string
  name: string
  family: PhenomenonFamily
  conserved: ConservedKind[]
  typicalDescription: RealityDescription
  closed: false
  source: 'internal-reference' | 'ingested'
}

export interface PhenomenonSpec {
  id: string
  family: PhenomenonFamily
  requiredKnowledge: string[]
  conserved: ConservedKind[]
  defaultDescription: RealityDescription
  closedList: false
}

export interface QuantityBudget {
  mass: number
  energy: number
  charge: number
  momentum: [number, number, number]
}

export interface FieldSample {
  kind: FieldKind
  scalar: number
  vector: [number, number, number]
  rayTraced: false
  shaderField: false
}
