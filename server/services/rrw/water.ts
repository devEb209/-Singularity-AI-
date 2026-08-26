import { phaseAt } from './matter.js'
import { requireSubstance } from './substances.js'

export const describeWater = (temperatureK: number, salinity = 0, turbidity = 0.05) => {
  const substance = requireSubstance('H2O')
  const phase = phaseAt(substance, temperatureK)
  return {
    formula: substance.formula,
    molarMass: substance.molarMass,
    phase,
    salinity,
    turbidity,
    refractiveIndex: substance.refractiveIndex + salinity * 0.0002,
    absorption: substance.optical.absorption,
    shaderWater: false as const,
    heightfieldIsIdentity: false as const,
  }
}
