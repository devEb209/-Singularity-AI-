export type V3 = [number, number, number]

export interface CcdHit {
  hit: boolean
  toi: number
  method: string
}

export interface Link {
  mass: number
  length: number
  com: number
  inertiaCom: number
}

export interface ChainState {
  q: number[]
  qd: number[]
}
