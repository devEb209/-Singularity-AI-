import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { presentWorld } from './present.js'
import type { RealityNode, Situation } from './types.js'

export const presentLive = (nodes: RealityNode[]) => {
  const situations: Situation[] = situationsNearShore(nodes).map(item => {
    if (item.nodeId === 'shelter' || item.nodeId === 'chronicle' || item.nodeId === 'human') {
      return { ...item, interacting: true, relevance: 0.92, visible: true, precision: 0.55 }
    }
    return item
  })
  const weak = adaptWorld(nodes, situations, deviceProfiles.ancient)
  const strong = adaptWorld(nodes, situations, deviceProfiles.dedicated)
  const presented = presentWorld(nodes, weak.adaptations)
  return {
    sameIds: weak.adaptations.map(item => item.nodeId).sort().join(',') === strong.adaptations.map(item => item.nodeId).sort().join(','),
    packets: presented.packets.length,
    hasChronicle: nodes.some(item => item.id === 'chronicle'),
    framebufferFoundation: presented.framebufferFoundation,
    meshIsFoundation: presented.meshIsFoundation,
  }
}
