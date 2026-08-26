import { phaseAt } from './matter.js'
import { requireSubstance } from './substances.js'
import type { KnowledgeClaim, RealityNode, RealityRelation } from './types.js'

const claim = (id: string, statement: string, source: string): KnowledgeClaim => ({
  id,
  statement,
  state: 'KNOWN',
  inferred: false,
  source,
})

const node = (partial: Omit<RealityNode, 'phase' | 'claims'> & { claims?: KnowledgeClaim[] }): RealityNode => {
  const substance = partial.substanceId ? requireSubstance(partial.substanceId) : undefined
  return {
    ...partial,
    phase: substance ? phaseAt(substance, partial.temperatureK) : 'mixture',
    claims: partial.claims ?? [],
  }
}

export const seedReality = () => {
  const nodes: RealityNode[] = [
    node({ id: 'star-sol', kind: 'phenomenon', label: 'reference star', substanceId: 'H', temperatureK: 5772, pressurePa: 1e8, extent: { kind: 'sphere', center: [0, 80, -20], radius: 8 }, emissionScale: 1, claims: [claim('c-sol', 'Reference star, not a NASA live feed', 'internal-reference')], inventory: [{ substanceId: 'H', moles: 80 }, { substanceId: 'He', moles: 8 }], domain: 'astronomy' }),
    node({ id: 'planet-ref', kind: 'structure', label: 'reference planet', substanceId: 'SiO2', temperatureK: 288, pressurePa: 101325, extent: { kind: 'sphere', center: [0, -40, 0], radius: 40 }, emissionScale: 0, claims: [claim('c-earth', 'Earth is reference, not limit', 'tese-dos-d')], domain: 'astronomy' }),
    node({ id: 'atmosphere', kind: 'field', label: 'N2/O2 atmosphere', substanceId: 'N2', temperatureK: 255, pressurePa: 70000, extent: { kind: 'sphere', center: [0, 0, 0], radius: 12 }, emissionScale: 0, inventory: [{ substanceId: 'N2', moles: 78.08 }, { substanceId: 'O2', moles: 20.95 }, { substanceId: 'Ar', moles: 0.93 }, { substanceId: 'CO2', moles: 0.42 }, { substanceId: 'H2O', moles: 1 }], domain: 'atmosphere' }),
    node({ id: 'ocean', kind: 'matter', label: 'ocean water', substanceId: 'H2O', temperatureK: 287, pressurePa: 101325, extent: { kind: 'box', min: [-20, -2, -20], max: [20, 0.2, 20] }, emissionScale: 0, claims: [claim('c-h2o', 'H2O molar mass 18.015 g/mol', 'internal-reference')], inventory: [{ substanceId: 'H2O', moles: 1000 }, { substanceId: 'NaCl', moles: 10 }], domain: 'oceans' }),
    node({ id: 'terrain', kind: 'structure', label: 'silicate terrain', substanceId: 'SiO2', temperatureK: 290, pressurePa: 101325, extent: { kind: 'implicit', field: 'height', center: [0, 0, 0] }, emissionScale: 0, domain: 'geology' }),
    node({ id: 'outcrop', kind: 'matter', label: 'granite outcrop', substanceId: 'SiO2', temperatureK: 289, pressurePa: 101325, extent: { kind: 'box', min: [3, 0, -1], max: [5, 1.4, 1] }, emissionScale: 0, inventory: [{ substanceId: 'SiO2', moles: 40 }, { substanceId: 'CaCO3', moles: 4 }], domain: 'geology' }),
    node({ id: 'soil', kind: 'matter', label: 'soil layer', substanceId: 'SiO2', temperatureK: 289, pressurePa: 101325, extent: { kind: 'box', min: [-8, -0.4, -8], max: [8, 0, 8] }, emissionScale: 0, inventory: [{ substanceId: 'SiO2', moles: 80 }, { substanceId: 'Fe2O3', moles: 5 }, { substanceId: 'C6H10O5', moles: 2 }, { substanceId: 'H2O', moles: 4 }], domain: 'geology' }),
    node({ id: 'river', kind: 'matter', label: 'fresh water', substanceId: 'H2O', temperatureK: 286, pressurePa: 101325, extent: { kind: 'box', min: [-1.2, -0.3, -6], max: [-0.4, 0.15, 4] }, emissionScale: 0, inventory: [{ substanceId: 'H2O', moles: 80 }], domain: 'oceans' }),
    node({ id: 'tree', kind: 'living', label: 'cellulose plant', substanceId: 'C6H10O5', temperatureK: 291, pressurePa: 101325, extent: { kind: 'sphere', center: [-2, 1.2, 1], radius: 1.1 }, living: { species: 'tree', identity: 'grove-a', consciousnessClaim: false }, emissionScale: 0, inventory: [{ substanceId: 'C6H10O5', moles: 6 }, { substanceId: 'H2O', moles: 8 }], domain: 'life' }),
    node({ id: 'human', kind: 'living', label: 'human observer-body', substanceId: 'H2O', temperatureK: 310, pressurePa: 101325, extent: { kind: 'box', min: [0.2, 0, 3.4], max: [0.7, 1.7, 3.8] }, living: { species: 'human', identity: 'walker-1', consciousnessClaim: false }, emissionScale: 0, inventory: [{ substanceId: 'H2O', moles: 40 }, { substanceId: 'C6H12O6', moles: 1.2 }], domain: 'organisms' }),
    node({ id: 'animal', kind: 'living', label: 'shore animal', substanceId: 'H2O', temperatureK: 308, pressurePa: 101325, extent: { kind: 'box', min: [-3.2, 0, 2.1], max: [-2.7, 0.6, 2.6] }, living: { species: 'animal', identity: 'shore-1', consciousnessClaim: false }, emissionScale: 0, inventory: [{ substanceId: 'H2O', moles: 12 }, { substanceId: 'C6H12O6', moles: 0.4 }], domain: 'organisms' }),
    node({ id: 'tool', kind: 'matter', label: 'iron tool', substanceId: 'Fe', temperatureK: 293, pressurePa: 101325, extent: { kind: 'box', min: [0.6, 0.9, 3.5], max: [0.95, 1.05, 3.7] }, emissionScale: 0, magneticMoment: [0, 2.2, 0], inventory: [{ substanceId: 'Fe', moles: 3 }], domain: 'matter' }),
    node({ id: 'cloud', kind: 'field', label: 'water vapor cloud', substanceId: 'H2O', temperatureK: 268, pressurePa: 80000, extent: { kind: 'sphere', center: [-4, 6, -3], radius: 2.2 }, emissionScale: 0, inventory: [{ substanceId: 'H2O', moles: 12 }], chargeC: 4e-4, domain: 'climate' }),
    node({ id: 'storm', kind: 'field', label: 'charged storm cell', substanceId: 'N2', temperatureK: 250, pressurePa: 75000, extent: { kind: 'sphere', center: [6, 7, -4], radius: 1.6 }, emissionScale: 0, chargeC: -4e-4, domain: 'electricity' }),
    node({ id: 'fire', kind: 'phenomenon', label: 'combustion', substanceId: 'C', temperatureK: 1100, pressurePa: 101325, extent: { kind: 'sphere', center: [1.4, 0.3, 3.2], radius: 0.25 }, emissionScale: 0.45, inventory: [{ substanceId: 'C', moles: 3 }, { substanceId: 'O2', moles: 5 }], domain: 'chemistry' }),
    node({ id: 'eye', kind: 'observer', label: 'human photopic observer', temperatureK: 310, pressurePa: 101325, extent: { kind: 'sphere', center: [0.45, 1.55, 3.55], radius: 0.03 }, emissionScale: 0, domain: 'perception' }),
  ]
  const relations: RealityRelation[] = [
    { from: 'planet-ref', to: 'ocean', kind: 'contains' },
    { from: 'planet-ref', to: 'terrain', kind: 'contains' },
    { from: 'planet-ref', to: 'soil', kind: 'contains' },
    { from: 'atmosphere', to: 'planet-ref', kind: 'surrounds' },
    { from: 'human', to: 'terrain', kind: 'on' },
    { from: 'tree', to: 'terrain', kind: 'on' },
    { from: 'animal', to: 'terrain', kind: 'on' },
    { from: 'tool', to: 'human', kind: 'held-by' },
    { from: 'star-sol', to: 'ocean', kind: 'illuminates' },
    { from: 'star-sol', to: 'human', kind: 'illuminates' },
    { from: 'eye', to: 'ocean', kind: 'observes' },
    { from: 'eye', to: 'fire', kind: 'observes' },
    { from: 'river', to: 'ocean', kind: 'exchanges' },
    { from: 'tree', to: 'animal', kind: 'feeds' },
    { from: 'planet-ref', to: 'star-sol', kind: 'orbits' },
  ]
  return { nodes, relations, meshIsFoundation: false as const, pbrIsFoundation: false as const }
}

export const nodeById = (nodes: RealityNode[], id: string) => nodes.find(item => item.id === id)
