import type { Cell } from '../ues-shared/math.js'
import type { NmnAction } from '../nmn/types.js'

export interface NavGrid {
  size: number
  walkable: boolean[][]
  cost: number[][]
  verification: { walkableCells: number; isolated: boolean }
}

export interface AgentStep {
  id: string
  position: Cell
  velocity: [number, number]
  radius: number
  preferred: [number, number]
}

export interface IntentTarget {
  action: NmnAction
  target: Cell
  reason: string
}
