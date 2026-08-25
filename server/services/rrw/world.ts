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
    node({ id: 'star-sol', kind: 'phenomenon', label: 'reference star', substanceId: 'H', temperatureK: 5772, pressurePa: 1e8, extent: { kind: 'sphere', center: [0, 80, -20], radius: 8 }, emissionScale: 1, claims: [claim('c-sol', 'Reference star, not a NASA live feed', 'internal-reference')] }),
    node({ id: 'planet-ref', kind: 'structure', label: 'reference planet', substanceId: 'SiO2', temperatureK: 288, pressurePa: 101325, extent: { kind: 'sphere', center: [0, -40, 0], radius: 40 }, emissionScale: 0, claims: [claim('c-earth', 'Earth is reference, not limit', 'tese-dos-d')] }),
    node({ id: 'atmosphere', kind: 'field', label: 'N2/O2 atmosphere', substanceId: 'N2', temperatureK: 255, pressurePa: 70000, extent: { kind: 'sphere', center: [0, 0, 0], radius: 12 }, emissionScale: 0 }),
    node({ id: 'ocean', kind: 'matter', label: 'ocean water', substanceId: 'H2O', temperatureK: 287, pressurePa: 101325, extent: { kind: 'box', min: [-20, -2, -20], max: [20, 0.2, 20] }, emissionScale: 0, claims: [claim('c-h2o', 'H2O molar mass 18.015 g/mol', 'internal-reference')] }),
    node({ id: 'terrain', kind: 'structure', label: 'silicate terrain', substanceId: 'SiO2', temperatureK: 290, pressurePa: 101325, extent: { kind: 'implicit', field: 'height', center: [0, 0, 0] }, emissionScale: 0 }),
    node({ id: 'outcrop', kind: 'matter', label: 'granite outcrop', substanceId: 'SiO2', temperatureK: 289, pressurePa: 101325, extent: { kind: 'box', min: [3, 0, -1], max: [5, 1.4, 1] }, emissionScale: 0 }),
    node({ id: 'tree', kind: 'living', label: 'cellulose plant', substanceId: 'C6H10O5', temperatureK: 291, pressurePa: 101325, extent: { kind: 'sphere', center: [-2, 1.2, 1], radius: 1.1 }, living: { species: 'tree', identity: 'grove-a', consciousnessClaim: false }, emissionScale: 0 }),
    node({ id: 'human', kind: 'living', label: 'human observer-body', substanceId: 'H2O', temperatureK: 310, pressurePa: 101325, extent: { kind: 'box', min: [0.2, 0, 3.4], max: [0.7, 1.7, 3.8] }, living: { species: 'human', identity: 'walker-1', consciousnessClaim: false }, emissionScale: 0 }),
    node({ id: 'tool', kind: 'matter', label: 'iron tool', substanceId: 'Fe', temperatureK: 293, pressurePa: 101325, extent: { kind: 'box', min: [0.6, 0.9, 3.5], max: [0.95, 1.05, 3.7] }, emissionScale: 0 }),
    node({ id: 'cloud', kind: 'field', label: 'water vapor cloud', substanceId: 'H2O', temperatureK: 268, pressurePa: 80000, extent: { kind: 'sphere', center: [-4, 6, -3], radius: 2.2 }, emissionScale: 0 }),
    node({ id: 'fire', kind: 'phenomenon', label: 'combustion', substanceId: 'C', temperatureK: 1100, pressurePa: 101325, extent: { kind: 'sphere', center: [1.4, 0.3, 3.2], radius: 0.25 }, emissionScale: 0.45 }),
    node({ id: 'eye', kind: 'observer', label: 'human photopic observer', temperatureK: 310, pressurePa: 101325, extent: { kind: 'sphere', center: [0.45, 1.55, 3.55], radius: 0.03 }, emissionScale: 0 }),
  ]
  const relations: RealityRelation[] = [
    { from: 'planet-ref', to: 'ocean', kind: 'contains' },
    { from: 'planet-ref', to: 'terrain', kind: 'contains' },
    { from: 'atmosphere', to: 'planet-ref', kind: 'surrounds' },
    { from: 'human', to: 'terrain', kind: 'on' },
    { from: 'tree', to: 'terrain', kind: 'on' },
    { from: 'tool', to: 'human', kind: 'held-by' },
    { from: 'star-sol', to: 'ocean', kind: 'illuminates' },
    { from: 'star-sol', to: 'human', kind: 'illuminates' },
    { from: 'eye', to: 'ocean', kind: 'observes' },
    { from: 'eye', to: 'fire', kind: 'observes' },
  ]
  return { nodes, relations, meshIsFoundation: false as const, pbrIsFoundation: false as const }
}

export const nodeById = (nodes: RealityNode[], id: string) => nodes.find(item => item.id === id)
