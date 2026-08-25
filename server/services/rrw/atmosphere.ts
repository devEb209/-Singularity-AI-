import { mixAbsorption } from './matter.js'
import type { MixturePart, RealityNode, SpectrumBand } from './types.js'

export const dryAir: MixturePart[] = [
  { substanceId: 'N2', moles: 78.08 },
  { substanceId: 'O2', moles: 20.95 },
  { substanceId: 'Ar', moles: 0.93 },
  { substanceId: 'CO2', moles: 0.04 },
]

export const fractionOf = (parts: MixturePart[], substanceId: string) => {
  const total = parts.reduce((sum, part) => sum + part.moles, 0) || 1
  return (parts.find(item => item.substanceId === substanceId)?.moles ?? 0) / total
}

export const airFrom = (node?: RealityNode): MixturePart[] => {
  if (node?.inventory?.length) return node.inventory
  return [...dryAir, { substanceId: 'H2O', moles: 1 }]
}

export const opticalMix = (parts: MixturePart[], band: SpectrumBand) =>
  mixAbsorption(parts.map(part => ({ id: part.substanceId, fraction: part.moles })), band)

export const describeAtmosphere = (node?: RealityNode) => {
  const parts = airFrom(node)
  return {
    o2: fractionOf(parts, 'O2'),
    n2: fractionOf(parts, 'N2'),
    co2: fractionOf(parts, 'CO2'),
    h2o: fractionOf(parts, 'H2O'),
    breathable: fractionOf(parts, 'O2') > 0.16,
    skybox: false as const,
    shaderAtmosphere: false as const,
  }
}
