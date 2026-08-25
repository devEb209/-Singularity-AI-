import { requireSubstance } from './substances.js'

export const snell = (n1: number, n2: number, incidenceRad: number) => {
  const ratio = n1 / n2
  const s = ratio * Math.sin(incidenceRad)
  if (Math.abs(s) > 1) return { transmitted: undefined as number | undefined, totalInternal: true, reflectance: 1 }
  const transmitted = Math.asin(s)
  const r = ((n1 - n2) / (n1 + n2)) ** 2
  return { transmitted, totalInternal: false, reflectance: r }
}

export const interfaceOf = (fromId: string, toId: string, incidenceDeg: number) => {
  const n1 = requireSubstance(fromId).refractiveIndex
  const n2 = requireSubstance(toId).refractiveIndex
  const incidence = incidenceDeg * Math.PI / 180
  const result = snell(n1, n2, incidence)
  return {
    n1,
    n2,
    incidenceDeg,
    transmittedDeg: result.transmitted === undefined ? undefined : result.transmitted * 180 / Math.PI,
    totalInternal: result.totalInternal,
    reflectance: result.reflectance,
    shaderGlass: false as const,
    pbr: false as const,
  }
}

export const compareAirWater = () => {
  const intoWater = interfaceOf('N2', 'H2O', 30)
  const intoAir = interfaceOf('H2O', 'N2', 30)
  return {
    intoWater,
    intoAir,
    bendsTowardNormal: (intoWater.transmittedDeg ?? 90) < 30,
    moreReflectiveLeaving: intoAir.reflectance > intoWater.reflectance || intoAir.totalInternal,
  }
}
