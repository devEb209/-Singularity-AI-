import type { Adaptation, DeviceProfile, RealityDescription, RealityNode, Situation } from './types.js'

export const deviceProfiles: Record<DeviceProfile['class'], DeviceProfile> = {
  cpu: { class: 'cpu', cores: 2, memoryMB: 2048, presentGpu: false, interactiveSlots: 1, continuumSlots: 1, spectralSlots: 1 },
  ancient: { class: 'ancient', cores: 1, memoryMB: 1024, presentGpu: false, interactiveSlots: 1, continuumSlots: 1, spectralSlots: 0 },
  mobile: { class: 'mobile', cores: 4, memoryMB: 3072, presentGpu: false, interactiveSlots: 1, continuumSlots: 2, spectralSlots: 1 },
  igpu: { class: 'igpu', cores: 6, memoryMB: 8192, presentGpu: true, interactiveSlots: 2, continuumSlots: 4, spectralSlots: 3 },
  integrated: { class: 'integrated', cores: 8, memoryMB: 12288, presentGpu: true, interactiveSlots: 3, continuumSlots: 5, spectralSlots: 4 },
  dedicated: { class: 'dedicated', cores: 16, memoryMB: 32768, presentGpu: true, interactiveSlots: 5, continuumSlots: 8, spectralSlots: 6 },
}

const scoreOf = (situation: Situation) =>
  situation.relevance * (situation.interacting ? 2.2 : 1) * (situation.visible ? 1.15 : 0.55) / (1 + situation.distance)

const wanted = (situation: Situation): RealityDescription => {
  if (!situation.visible && !situation.interacting && situation.relevance < 0.2) return 'dormant-reconstructable'
  if (situation.interacting && situation.relevance >= 0.7) return 'interactive-local'
  if (situation.visible && situation.precision >= 0.6 && situation.distance < 6) return 'spectral-transport'
  if (situation.visible && situation.distance < 14) return 'continuum'
  if (situation.visible) return 'statistical'
  return 'law'
}

const slotOf = (description: RealityDescription): keyof Pick<DeviceProfile, 'interactiveSlots' | 'continuumSlots' | 'spectralSlots'> | null => {
  if (description === 'interactive-local') return 'interactiveSlots'
  if (description === 'spectral-transport') return 'spectralSlots'
  if (description === 'continuum' || description === 'discrete-body') return 'continuumSlots'
  return null
}

const degrade = (description: RealityDescription): RealityDescription => {
  if (description === 'interactive-local') return 'spectral-transport'
  if (description === 'spectral-transport') return 'continuum'
  if (description === 'continuum') return 'statistical'
  if (description === 'discrete-body') return 'statistical'
  if (description === 'statistical') return 'law'
  return 'dormant-reconstructable'
}

export const adaptWorld = (nodes: RealityNode[], situations: Situation[], device: DeviceProfile) => {
  const remaining = { ...device }
  const ranked = [...situations].sort((a, b) => scoreOf(b) - scoreOf(a))
  const byId = new Map(ranked.map(item => [item.nodeId, item]))
  const adaptations: Adaptation[] = nodes.map(node => {
    const situation = byId.get(node.id) ?? { nodeId: node.id, distance: 40, relevance: 0.05, interacting: false, visible: false, phenomenon: 'idle', precision: 0.2 }
    let description = wanted(situation)
    if (node.kind === 'living' && description === 'continuum') description = 'discrete-body'
    let slot = slotOf(description)
    while (slot && remaining[slot] <= 0) {
      description = degrade(description)
      slot = slotOf(description)
    }
    if (slot) remaining[slot] -= 1
    return {
      nodeId: node.id,
      description,
      reason: `${device.class}: ${situation.phenomenon} d=${situation.distance} rel=${situation.relevance}`,
      preset: false,
      sameReality: true,
    }
  })
  return {
    adaptations,
    device: device.class,
    presentGpu: device.presentGpu,
    lod: false,
    ultraPreset: false,
    hardwareDeterminesArchitecture: false,
  }
}

export const situationsNearShore = (nodes: RealityNode[]): Situation[] =>
  nodes.map(node => {
    if (node.id === 'ocean') return { nodeId: node.id, distance: 1.4, relevance: 0.95, interacting: true, visible: true, phenomenon: 'water-contact', precision: 0.8 }
    if (node.id === 'human' || node.id === 'eye') return { nodeId: node.id, distance: 0.2, relevance: 1, interacting: true, visible: true, phenomenon: 'self', precision: 0.7 }
    if (node.id === 'fire') return { nodeId: node.id, distance: 2.1, relevance: 0.72, interacting: false, visible: true, phenomenon: 'combustion', precision: 0.6 }
    if (node.id === 'tool') return { nodeId: node.id, distance: 0.4, relevance: 0.7, interacting: true, visible: true, phenomenon: 'grasp', precision: 0.55 }
    if (node.id === 'tree') return { nodeId: node.id, distance: 4, relevance: 0.4, interacting: false, visible: true, phenomenon: 'vegetation', precision: 0.4 }
    if (node.id === 'star-sol') return { nodeId: node.id, distance: 90, relevance: 0.85, interacting: false, visible: true, phenomenon: 'illumination', precision: 0.5 }
    if (node.id === 'atmosphere' || node.id === 'cloud') return { nodeId: node.id, distance: 18, relevance: 0.25, interacting: false, visible: true, phenomenon: 'sky', precision: 0.3 }
    if (node.id === 'planet-ref') return { nodeId: node.id, distance: 40, relevance: 0.1, interacting: false, visible: false, phenomenon: 'context', precision: 0.2 }
    return { nodeId: node.id, distance: 8, relevance: 0.3, interacting: false, visible: true, phenomenon: 'background', precision: 0.3 }
  })
