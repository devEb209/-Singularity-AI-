import type { Cell } from '../ues-shared/math.js'
import type { NmnFidelity } from '../nmn/types.js'

export type Occupation = 'farmer' | 'medic' | 'guard' | 'merchant' | 'child' | 'clerk'

export interface Household {
  id: string
  home: Cell
  members: string[]
}

export interface NeedState {
  food: number
  rest: number
  social: number
}

export interface Resident {
  id: string
  householdId: string
  occupation: Occupation
  outdoor: boolean
  cell: Cell
  home: Cell
  work: Cell
  fidelity: NmnFidelity
  needs: NeedState
  lastAction: string
  hour: number
}

export interface ClimateState {
  heat: number
  rain: number
  danger: number
  label: string
}
