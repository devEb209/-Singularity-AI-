import { adaptWorld, deviceProfiles } from './do15.js'
import type { RealityNode, Situation } from './types.js'
import { seedReality } from './world.js'

export const populateGrove = (count = 48) => {
  const base = seedReality()
  const extra: RealityNode[] = []
  for (let i = 0; i < count; i++) {
    const x = -6 + (i % 8) * 1.4
    const z = -4 + Math.floor(i / 8) * 1.5
    extra.push({
      id: `grove-${i}`,
      kind: 'living',
      label: 'grove member',
      substanceId: 'C6H10O5',
      temperatureK: 291,
      pressurePa: 101325,
      phase: 'solid',
      extent: { kind: 'sphere', center: [x, 1, z], radius: 0.45 },
      living: { species: 'tree', identity: `grove-${i}`, consciousnessClaim: false },
      emissionScale: 0,
      claims: [],
    })
  }
  const nodes = [...base.nodes, ...extra]
  const situations: Situation[] = nodes.map((node, index) => ({
    nodeId: node.id,
    distance: node.id.startsWith('grove-') ? 6 + (index % 5) : 4,
    relevance: node.id.startsWith('grove-') ? 0.22 : 0.5,
    interacting: node.id === 'human',
    visible: node.id !== 'planet-ref',
    phenomenon: node.kind,
    precision: 0.3,
  }))
  const weak = adaptWorld(nodes, situations, deviceProfiles.ancient)
  const strong = adaptWorld(nodes, situations, deviceProfiles.dedicated)
  const weakIds = weak.adaptations.map(item => item.nodeId).sort().join(',')
  const strongIds = strong.adaptations.map(item => item.nodeId).sort().join(',')
  return {
    nodes: nodes.length,
    sameIds: weakIds === strongIds,
    weakDormant: weak.adaptations.filter(item => item.description === 'dormant-reconstructable' || item.description === 'law').length,
    strongInteractive: strong.adaptations.filter(item => item.description === 'interactive-local' || item.description === 'continuum').length,
    uniqueFullMinds: false as const,
    lod: false as const,
  }
}
