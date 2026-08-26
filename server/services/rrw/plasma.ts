import { phaseAt } from './matter.js'
import { requireSubstance } from './substances.js'

export const ionizationK: Record<string, number> = {
  H: 157800,
  He: 285000,
  N: 168000,
  O: 158000,
  Fe: 91200,
  Au: 103700,
}

export const ionizationFraction = (substanceId: string, temperatureK: number) => {
  const ionization = ionizationK[substanceId] ?? 120000
  const width = Math.max(800, ionization * 0.08)
  return 1 / (1 + Math.exp((ionization * 0.08 - temperatureK) / width))
}

export const describePlasma = (substanceId: string, temperatureK: number) => {
  const substance = requireSubstance(substanceId)
  const fraction = ionizationFraction(substanceId, temperatureK)
  const phase = phaseAt(substance, temperatureK)
  return {
    substanceId,
    temperatureK,
    fraction,
    phase,
    conducting: fraction > 0.05 || substance.electricalConductivity > 1,
    shaderPlasma: false as const,
  }
}

export const compareStarAndAir = () => {
  const star = describePlasma('H', 5772)
  const air = describePlasma('N2', 255)
  return { star, air, starMoreIonized: star.fraction > air.fraction }
}
