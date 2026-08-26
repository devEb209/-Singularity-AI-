import { realityLayers } from './catalog.js'
import type { LayerEntity } from './types.js'
import type { LayerId } from './types.js'

const law = (id: string, layer: LayerId, label: string, kind: string, properties: LayerEntity['properties'] = {}): LayerEntity => ({
  id,
  layer,
  label,
  kind,
  properties: { ...properties, inferenceIsFact: false },
  description: 'law',
  inferred: true,
  consciousnessClaim: false,
})

const specific = (layer: LayerId): LayerEntity[] => {
  if (layer === 0) return [law('meta-causality', 0, 'causal order', 'law', { timeReversibleClaim: false })]
  if (layer === 1) return [law('field-em', 1, 'electromagnetic field', 'field', { rayTraced: false })]
  if (layer === 2) return [law('quark-up', 2, 'up quark (law-level)', 'particle', { alwaysOnAtomic: false })]
  if (layer === 3) return [law('isotope-c12', 3, 'carbon-12 (law-level)', 'atom', { nistAssay: false })]
  if (layer === 4) return [law('bond-covalent', 4, 'covalent bond class', 'bond')]
  if (layer === 7) return [law('macro-mechanics', 7, 'macroscopic mechanics', 'process')]
  if (layer === 11) return [law('prebiotic-membrane', 11, 'primitive membrane', 'system', { abiogenesisSolved: false })]
  if (layer === 12) return [law('genome-template', 12, 'nucleic-acid template', 'molecule', { sequencedGenome: false })]
  if (layer === 13) return [law('cell-unit', 13, 'cell unit', 'cell', { fullCellSim: false })]
  if (layer === 15) return [law('selection-pressure', 15, 'selection pressure', 'process')]
  if (layer === 16) return [law('food-web-law', 16, 'trophic law', 'process')]
  if (layer === 18) return [law('cognition-model', 18, 'cognition as model', 'model', { consciousnessReproduced: false })]
  if (layer === 19) return [law('individual-history', 19, 'individual history', 'agent')]
  if (layer === 21) return [law('society-group', 21, 'social group', 'group')]
  if (layer === 22) return [law('resource-flow', 22, 'resource flow', 'economy')]
  if (layer === 23) return [law('governance-rule', 23, 'governance rule', 'norm')]
  if (layer === 28) return [law('galaxy-law', 28, 'galactic potential (law-level)', 'structure', { nasaSurvey: false })]
  if (layer === 29) return [law('cosmos-expansion', 29, 'expansion parameter', 'cosmology', { measuredCMB: false })]
  return []
}

export const syntheticForLayer = (layer: LayerId): LayerEntity[] => {
  const found = specific(layer)
  if (found.length) return found
  const spec = realityLayers.find(item => item.id === layer)
  return [law(`layer-${layer}-anchor`, layer, spec?.name ?? `layer ${layer}`, 'anchor')]
}
