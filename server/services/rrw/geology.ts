import { fractionOf } from './atmosphere.js'
import { molesOf } from './extent.js'
import type { RealityNode } from './types.js'

export const describeSoil = (node?: RealityNode) => {
  const inventory = node?.inventory ?? [
    { substanceId: 'SiO2', moles: 80 },
    { substanceId: 'Fe2O3', moles: 5 },
    { substanceId: 'C6H10O5', moles: 2 },
    { substanceId: 'H2O', moles: 4 },
  ]
  const silica = fractionOf(inventory, 'SiO2')
  const water = fractionOf(inventory, 'H2O')
  const organics = fractionOf(inventory, 'C6H10O5')
  return {
    silica,
    water,
    organics,
    hematite: fractionOf(inventory, 'Fe2O3'),
    kind: water > 0.2 ? 'wet-soil' : organics > 0.05 ? 'humus' : 'mineral',
    heightmapIsIdentity: false as const,
    calcite: molesOf(node ?? { inventory, id: 'soil', kind: 'matter', label: 'soil', temperatureK: 290, pressurePa: 101325, phase: 'solid', extent: { kind: 'implicit', field: 'height' }, emissionScale: 0, claims: [] }, 'CaCO3'),
  }
}

export const layeredCrust = () => ([
  { id: 'soil', substances: ['SiO2', 'Fe2O3', 'C6H10O5', 'H2O'] },
  { id: 'regolith', substances: ['SiO2', 'Fe2O3'] },
  { id: 'bedrock', substances: ['SiO2', 'CaCO3'] },
] as const)
