import type { DKey } from '../d-thesis/types.js'

export type RealityMode =
  | 'real-life'
  | 'cartoon'
  | 'toon-force'
  | 'fantasy'
  | 'sci-fi'
  | 'stylized'
  | 'surreal'
  | 'custom'

export type DomainCategory =
  | 'natural-science'
  | 'human-behavior'
  | 'engineering'
  | 'natural-system'
  | 'artificial-system'
  | 'custom'

export type HardwareTier = 'low' | 'balanced' | 'high'

export type KnowledgeConfidence =
  | 'established'
  | 'strong-evidence'
  | 'moderate-evidence'
  | 'uncertain'
  | 'hypothesis'
  | 'speculation'

export interface RealityDomain {
  id: string
  name: string
  category: DomainCategory
  purpose: string
  principles: string[]
  relations: string[]
  applicableDs: DKey[]
  closed: false
  seeded: boolean
}

export interface RealitySource {
  id?: string
  title: string
  statement: string
  independent: boolean
  tested?: boolean
  contradicts?: string[]
}

export interface PhysicsLaws {
  gravity: number
  restitution: number
  friction: number
  fluidDensity: number
  wind: number
  temperature: number
  energyConservation: boolean
  deformation: number
  delayedGravity: boolean
  squashStretch: number
  impossibleAllowed: boolean
  magicSlots: string[]
  declaredRules: string[]
  energyGain: number
}

export interface EnvironmentNode {
  id: string
  value: number
  incoming: { from: string; weight: number }[]
}

export interface Representation {
  id: string
  kind: 'geometry' | 'material' | 'lighting' | 'particle' | 'audio' | 'physics' | 'npc' | 'simulation' | 'data'
  cost: number
  perceptual: number
  objectiveAlignment: number
  essential: boolean
}

export interface RealLifeRequest {
  objective: string
  phenomenon?: string
  mode: RealityMode
  domains?: string[]
  sources?: RealitySource[]
  hardware: HardwareTier
  customLaws?: Partial<PhysicsLaws>
  customDomain?: Omit<RealityDomain, 'closed' | 'seeded'>
  perturbation?: { node: string; magnitude: number }
}
