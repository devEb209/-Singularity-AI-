export interface Entity {
  id: string
  playerId: string
  x: number
  y: number
  vx: number
  vy: number
}

export interface PlayerInput {
  seq: number
  playerId: string
  ax: number
  ay: number
}

export type RejectReason = 'duplicate' | 'speed-hack' | 'spoof' | 'unbounded'

export interface NetConfig {
  latencyMs: number
  jitterMs: number
  loss: number
  duplicate: number
}
