export interface FluidGrid {
  n: number
  u: Float64Array
  v: Float64Array
  d: Float64Array
}

export interface FluidMetrics {
  mass: number
  meanAbsDiv: number
  comY: number
}

export interface VfxGate {
  name: string
  budgetMs: number
  ms: number
  overBudget: boolean
}
