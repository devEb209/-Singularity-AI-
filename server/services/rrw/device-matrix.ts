import { composeReality } from './compose.js'
import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { materialize } from './materialize.js'
import { presentWorld } from './present.js'
import type { RealityDescription, RealityNode } from './types.js'

const rankOf: Record<RealityDescription, number> = {
  'interactive-local': 6,
  'spectral-transport': 5,
  continuum: 4,
  'discrete-body': 3,
  statistical: 2,
  law: 1,
  'dormant-reconstructable': 0,
}

export const presentDevices = (nodes: RealityNode[]) => {
  const situations = situationsNearShore(nodes)
  const classes = Object.values(deviceProfiles)
  const views = classes.map(device => {
    const adapted = adaptWorld(nodes, situations, device)
    const presented = presentWorld(nodes, adapted.adaptations)
    const frame = materialize(nodes, adapted.adaptations, device)
    const ids = adapted.adaptations.map(item => item.nodeId).sort().join(',')
    const meanRank = adapted.adaptations.reduce((sum, item) => sum + rankOf[item.description], 0) / adapted.adaptations.length
    return {
      device: device.class,
      ids,
      meanRank,
      packets: presented.packets.length,
      backend: frame.backend,
      presentGpu: device.presentGpu,
      framebufferFoundation: presented.framebufferFoundation,
    }
  })
  const idSet = new Set(views.map(item => item.ids))
  const ancient = views.find(item => item.device === 'ancient')!
  const dedicated = views.find(item => item.device === 'dedicated')!
  return {
    views,
    sameIds: idSet.size === 1,
    weakerDescribesLess: ancient.meanRank < dedicated.meanRank,
    backends: views.map(item => item.backend),
    hardwareDeterminesArchitecture: false as const,
    ultraPreset: false as const,
  }
}

export const compareDevices = (prompt = 'oceano salgado com fogo e um humano') =>
  presentDevices(composeReality(prompt).nodes)
