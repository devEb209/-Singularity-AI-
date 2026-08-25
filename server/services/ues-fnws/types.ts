export interface WaterState {
  depth: number[][]
  evaporated: number
  rained: number
}

export interface WaveSample {
  x: number
  z: number
  eta: number
}
