import { adaptWorld, deviceProfiles } from './do15.js'
import { stepOrganisms } from './organism.js'
import type { RealityNode, Situation } from './types.js'
import { seedReality } from './world.js'

export const scaleLiving = (count = 120) => {
  const base = seedReality()
  const extra: RealityNode[] = []
  for (let i = 0; i < count; i++) {
    const tree = i % 3 !== 0
    extra.push({
      id: `life-${i}`,
      kind: 'living',
      label: tree ? 'scaled plant' : 'scaled animal',
      substanceId: tree ? 'C6H10O5' : 'H2O',
      temperatureK: tree ? 291 : 307,
      pressurePa: 101325,
      phase: tree ? 'solid' : 'mixture',
      extent: { kind: 'sphere', center: [-8 + (i % 12) * 1.2, tree ? 1 : 0.4, -6 + Math.floor(i / 12) * 1.1], radius: 0.35 },
      living: { species: tree ? 'tree' : 'animal', identity: `life-${i}`, consciousnessClaim: false },
      emissionScale: 0,
      claims: [],
      inventory: tree ? [{ substanceId: 'C6H10O5', moles: 1 }] : [{ substanceId: 'H2O', moles: 3 }, { substanceId: 'C6H12O6', moles: 0.1 }],
      domain: tree ? 'life' : 'organisms',
    })
  }
  const nodes = stepOrganisms([...base.nodes, ...extra])
  const situations: Situation[] = nodes.map((node, index) => ({
    nodeId: node.id,
    distance: node.id.startsWith('life-') ? 5 + (index % 7) : 3,
    relevance: node.id.startsWith('life-') ? 0.2 : 0.55,
    interacting: node.id === 'human',
    visible: node.id !== 'planet-ref',
    phenomenon: node.kind,
    precision: 0.28,
  }))
  const weak = adaptWorld(nodes, situations, deviceProfiles.ancient)
  const strong = adaptWorld(nodes, situations, deviceProfiles.dedicated)
  return {
    requested: count,
    nodes: nodes.length,
    sameIds: weak.adaptations.map(item => item.nodeId).sort().join(',') === strong.adaptations.map(item => item.nodeId).sort().join(','),
    weakDormant: weak.adaptations.filter(item => item.description === 'dormant-reconstructable' || item.description === 'law').length,
    strongInteractive: strong.adaptations.filter(item => item.description === 'interactive-local' || item.description === 'discrete-body').length,
    uniqueFullMinds: false as const,
    conceptualCap: false as const,
    consciousnessClaim: nodes.filter(item => item.living).every(item => item.living?.consciousnessClaim === false),
    lod: false as const,
  }
}
