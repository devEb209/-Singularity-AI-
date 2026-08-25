import { composeReality } from './compose.js'
import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { presentWorld } from './present.js'
import type { RealityNode } from './types.js'

export const reconstructDormant = (nodes: RealityNode[]) => {
  const adapted = adaptWorld(nodes, situationsNearShore(nodes), deviceProfiles.ancient)
  const presented = presentWorld(nodes, adapted.adaptations)
  const dormant = presented.packets.filter(packet => 'reconstructable' in packet && packet.reconstructable)
  const restored = dormant
    .map(packet => nodes.find(node => node.id === packet.id))
    .filter((node): node is RealityNode => Boolean(node))
  return {
    dormant: dormant.length,
    restored: restored.length,
    sameIds: dormant.length > 0 && dormant.every(packet => restored.some(node => node.id === packet.id)),
    stubsOnly: false as const,
    meshFromStub: false as const,
    learnedVision: false as const,
  }
}

export const compareReconstruct = (prompt = 'oceano salgado com um humano') =>
  reconstructDormant(composeReality(prompt).nodes)
