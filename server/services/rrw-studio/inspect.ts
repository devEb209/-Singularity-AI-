import { adaptWorld, deviceProfiles, situationsNearShore } from '../rrw/do15.js'
import { experienceAt } from '../rrw/observer.js'
import { seedReality } from '../rrw/world.js'

export const inspectReality = (device: keyof typeof deviceProfiles = 'mobile') => {
  const reality = seedReality()
  const adapted = adaptWorld(reality.nodes, situationsNearShore(reality.nodes), deviceProfiles[device])
  const focus = adapted.adaptations.find(item => item.nodeId === 'ocean')
  return {
    nodes: reality.nodes.map(node => ({
      id: node.id,
      kind: node.kind,
      substance: node.substanceId,
      phase: node.phase,
      domain: node.domain,
      inventory: node.inventory?.length ?? 0,
      description: adapted.adaptations.find(item => item.nodeId === node.id)?.description,
    })),
    selected: focus,
    experience: experienceAt(reality.nodes),
    meshViewport: false as const,
    aaaEditor: false as const,
  }
}
