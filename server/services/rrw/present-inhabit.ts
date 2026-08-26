import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { presentWorld } from './present.js'
import { composeWithStructures } from './structure.js'
import type { Situation } from './types.js'

export const presentInhabited = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const composed = composeWithStructures(`${prompt} habitar abrigo`)
  const situations: Situation[] = situationsNearShore(composed.nodes).map(item =>
    item.nodeId === 'shelter' ? { ...item, interacting: true, relevance: 0.9, visible: true, precision: 0.55 } : item,
  )
  const weak = adaptWorld(composed.nodes, situations, deviceProfiles.ancient)
  const strong = adaptWorld(composed.nodes, situations, deviceProfiles.dedicated)
  const presented = presentWorld(composed.nodes, weak.adaptations)
  const rank = (description: string) =>
    description === 'interactive-local' ? 6
      : description === 'spectral-transport' ? 5
        : description === 'continuum' ? 4
          : description === 'discrete-body' ? 3
            : description === 'statistical' ? 2
              : description === 'law' ? 1
                : 0
  const weakMean = weak.adaptations.reduce((sum, item) => sum + rank(item.description), 0) / weak.adaptations.length
  const strongMean = strong.adaptations.reduce((sum, item) => sum + rank(item.description), 0) / strong.adaptations.length
  return {
    sameIds: weak.adaptations.map(item => item.nodeId).sort().join(',') === strong.adaptations.map(item => item.nodeId).sort().join(','),
    weakerDescribesLess: weakMean < strongMean,
    hasShelter: composed.nodes.some(item => item.id === 'shelter'),
    packets: presented.packets.length,
    framebufferFoundation: presented.framebufferFoundation,
    meshIsFoundation: presented.meshIsFoundation,
  }
}
