import type { Cell } from '../ues-shared/math.js'
import type { NmnFidelity } from '../nmn/types.js'

export type DistrictKind = 'residential' | 'market' | 'industrial' | 'civic' | 'park'

export interface District {
  id: string
  kind: DistrictKind
  cx: number
  cz: number
  cells: Cell[]
}

export interface Citizen {
  id: string
  home: Cell
  work: Cell
  districtId: string
  workDistrictId: string
  occupation: string
  hour: number
  cell: Cell
  fidelity: NmnFidelity
  lastAction: 'sleep' | 'commute' | 'work' | 'home' | 'persist-only' | 'aggregate'
}
