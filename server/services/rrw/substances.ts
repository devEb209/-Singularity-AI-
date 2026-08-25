import type { OpticalCoeffs, SpectrumBand, Substance } from './types.js'
import { spectrumBands } from './types.js'

const optical = (absorption: number[], scattering: number[], emission: number[]): OpticalCoeffs => {
  const pack = (values: number[]) => Object.fromEntries(spectrumBands.map((band, index) => [band, values[index] ?? 0])) as Record<SpectrumBand, number>
  return { absorption: pack(absorption), scattering: pack(scattering), emission: pack(emission) }
}

const element = (partial: Omit<Substance, 'source'>): Substance => ({ ...partial, source: 'internal-reference' })

export const substances: Substance[] = [
  element({ id: 'H', formula: 'H', name: 'hydrogen', z: 1, molarMass: 1.008, density: 0.000089, meltK: 14, boilK: 20, phase293: 'gas', refractiveIndex: 1, specificHeat: 14300, thermalConductivity: 0.18, electricalConductivity: 0, optical: optical([0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01], [0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.001, 0.001], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'C', formula: 'C', name: 'carbon', z: 6, molarMass: 12.011, density: 2260, meltK: 3800, boilK: 4300, phase293: 'solid', refractiveIndex: 2.4, specificHeat: 710, thermalConductivity: 140, electricalConductivity: 1e5, optical: optical([8, 7, 6.5, 6, 5.5, 5, 3, 1], [0.4, 0.4, 0.35, 0.3, 0.25, 0.2, 0.1, 0.05], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'N', formula: 'N', name: 'nitrogen', z: 7, molarMass: 14.007, density: 0.00125, meltK: 63, boilK: 77, phase293: 'gas', refractiveIndex: 1.0003, specificHeat: 1040, thermalConductivity: 0.026, electricalConductivity: 0, optical: optical([0.08, 0.02, 0.01, 0.008, 0.006, 0.005, 0.004, 0.003], [0.02, 0.015, 0.012, 0.01, 0.008, 0.006, 0.003, 0.001], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'O', formula: 'O', name: 'oxygen', z: 8, molarMass: 15.999, density: 0.00143, meltK: 54, boilK: 90, phase293: 'gas', refractiveIndex: 1.0003, specificHeat: 918, thermalConductivity: 0.026, electricalConductivity: 0, optical: optical([0.12, 0.03, 0.015, 0.01, 0.008, 0.007, 0.02, 0.04], [0.02, 0.014, 0.011, 0.009, 0.007, 0.005, 0.003, 0.001], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'Na', formula: 'Na', name: 'sodium', z: 11, molarMass: 22.99, density: 968, meltK: 371, boilK: 1156, phase293: 'solid', refractiveIndex: 0.05, specificHeat: 1230, thermalConductivity: 140, electricalConductivity: 2.1e7, optical: optical([20, 18, 16, 14, 12, 10, 6, 2], [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.05, 0.02], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'Si', formula: 'Si', name: 'silicon', z: 14, molarMass: 28.085, density: 2329, meltK: 1687, boilK: 3538, phase293: 'solid', refractiveIndex: 3.4, specificHeat: 710, thermalConductivity: 150, electricalConductivity: 1.6e3, optical: optical([12, 8, 4, 2, 1.2, 0.8, 0.3, 0.1], [0.2, 0.18, 0.15, 0.12, 0.1, 0.08, 0.04, 0.02], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'Fe', formula: 'Fe', name: 'iron', z: 26, molarMass: 55.845, density: 7874, meltK: 1811, boilK: 3134, phase293: 'solid', refractiveIndex: 2.9, specificHeat: 449, thermalConductivity: 80, electricalConductivity: 1e7, optical: optical([30, 28, 26, 24, 22, 20, 8, 2], [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.03, 0.01], [0, 0, 0, 0, 0, 0, 0, 0.02]) }),
  element({ id: 'Au', formula: 'Au', name: 'gold', z: 79, molarMass: 196.967, density: 19300, meltK: 1337, boilK: 3129, phase293: 'solid', refractiveIndex: 0.47, specificHeat: 129, thermalConductivity: 318, electricalConductivity: 4.4e7, optical: optical([40, 35, 28, 12, 6, 3.5, 1.5, 0.4], [0.04, 0.04, 0.04, 0.05, 0.05, 0.06, 0.03, 0.01], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'H2', formula: 'H2', name: 'dihydrogen', molarMass: 2.016, density: 0.00009, meltK: 14, boilK: 20, phase293: 'gas', refractiveIndex: 1, specificHeat: 14300, thermalConductivity: 0.18, electricalConductivity: 0, optical: optical([0.01, 0.008, 0.006, 0.005, 0.004, 0.004, 0.003, 0.002], [0.002, 0.002, 0.002, 0.002, 0.001, 0.001, 0.001, 0.001], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'O2', formula: 'O2', name: 'dioxygen', molarMass: 31.998, density: 0.00143, meltK: 54, boilK: 90, phase293: 'gas', refractiveIndex: 1.0003, specificHeat: 918, thermalConductivity: 0.026, electricalConductivity: 0, optical: optical([0.14, 0.04, 0.02, 0.012, 0.01, 0.009, 0.03, 0.05], [0.02, 0.014, 0.011, 0.009, 0.007, 0.005, 0.003, 0.001], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'N2', formula: 'N2', name: 'dinitrogen', molarMass: 28.014, density: 0.00125, meltK: 63, boilK: 77, phase293: 'gas', refractiveIndex: 1.0003, specificHeat: 1040, thermalConductivity: 0.026, electricalConductivity: 0, optical: optical([0.07, 0.02, 0.01, 0.007, 0.006, 0.005, 0.004, 0.003], [0.02, 0.015, 0.012, 0.01, 0.008, 0.006, 0.003, 0.001], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'H2O', formula: 'H2O', name: 'water', molarMass: 18.015, density: 997, meltK: 273.15, boilK: 373.15, phase293: 'liquid', refractiveIndex: 1.333, specificHeat: 4182, thermalConductivity: 0.6, electricalConductivity: 5.5e-6, optical: optical([1.8, 0.12, 0.04, 0.035, 0.08, 0.25, 2.4, 8], [0.002, 0.003, 0.004, 0.004, 0.003, 0.002, 0.001, 0.001], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'CO2', formula: 'CO2', name: 'carbon-dioxide', molarMass: 44.01, density: 0.00198, meltK: 195, boilK: 195, phase293: 'gas', refractiveIndex: 1.0004, specificHeat: 844, thermalConductivity: 0.017, electricalConductivity: 0, optical: optical([0.2, 0.04, 0.02, 0.015, 0.02, 0.03, 1.1, 3.2], [0.01, 0.008, 0.006, 0.005, 0.004, 0.003, 0.002, 0.001], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'SiO2', formula: 'SiO2', name: 'silica', molarMass: 60.084, density: 2650, meltK: 1986, boilK: 3220, phase293: 'solid', refractiveIndex: 1.54, specificHeat: 730, thermalConductivity: 1.4, electricalConductivity: 1e-12, optical: optical([4, 0.4, 0.08, 0.05, 0.04, 0.04, 0.2, 1.2], [0.08, 0.06, 0.05, 0.04, 0.04, 0.03, 0.02, 0.01], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'NaCl', formula: 'NaCl', name: 'halite', molarMass: 58.44, density: 2160, meltK: 1074, boilK: 1738, phase293: 'solid', refractiveIndex: 1.54, specificHeat: 880, thermalConductivity: 6, electricalConductivity: 1e-7, optical: optical([0.6, 0.08, 0.03, 0.02, 0.02, 0.02, 0.15, 0.8], [0.04, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01], [0, 0, 0, 0, 0, 0, 0, 0]) }),
  element({ id: 'C6H10O5', formula: 'C6H10O5', name: 'cellulose', molarMass: 162.14, density: 1500, meltK: 530, boilK: 800, phase293: 'solid', refractiveIndex: 1.47, specificHeat: 1400, thermalConductivity: 0.23, electricalConductivity: 1e-12, optical: optical([3, 0.8, 0.35, 0.28, 0.4, 0.7, 1.6, 4], [0.3, 0.25, 0.2, 0.18, 0.16, 0.14, 0.08, 0.04], [0, 0, 0, 0, 0, 0, 0, 0]) }),
]

export const substanceById = (id: string) => substances.find(item => item.id === id)

export const requireSubstance = (id: string) => {
  const found = substanceById(id)
  if (!found) throw new Error(`unknown substance ${id}`)
  return found
}
