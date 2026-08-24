export const rungs = ['space', 'planet', 'continent', 'region', 'city', 'street', 'object'] as const
export type ScaleRung = typeof rungs[number]
export type ScaleFidelity = 'full' | 'simplified' | 'dormant'

export interface ScaleLayer {
  rung: ScaleRung
  representation: string
  fidelity: ScaleFidelity
  resident: boolean
  reconstructable: boolean
}

export const layerOf = (rung: ScaleRung, focus: ScaleRung): ScaleLayer => {
  const focusIndex = rungs.indexOf(focus)
  const index = rungs.indexOf(rung)
  const delta = Math.abs(index - focusIndex)
  const fidelity: ScaleFidelity = delta === 0 ? 'full' : delta === 1 ? 'simplified' : 'dormant'
  const representations: Record<ScaleRung, string> = {
    space: 'kepler-catalog',
    planet: 'geophysics-grid',
    continent: 'height-hydro-climate',
    region: 'semantic-cells',
    city: 'district-census',
    street: 'navmesh-buildings',
    object: 'mesh-material',
  }
  return {
    rung,
    representation: representations[rung],
    fidelity,
    resident: fidelity !== 'dormant',
    reconstructable: true,
  }
}

export const stack = (focus: ScaleRung): ScaleLayer[] => rungs.map(rung => layerOf(rung, focus))

export const pathBetween = (from: ScaleRung, to: ScaleRung) => {
  const a = rungs.indexOf(from)
  const b = rungs.indexOf(to)
  const step = a <= b ? 1 : -1
  const path: ScaleRung[] = []
  for (let i = a; i !== b + step; i += step) path.push(rungs[i])
  return path
}
