import { transport } from './coupling.js'
import { climateAt } from './climate.js'
import { centerOf } from './extent.js'
import { needsOf } from './organism.js'
import { solarSpectrum } from './spectrum.js'
import type { Adaptation, RealityDescription, RealityNode } from './types.js'

export const presentNode = (node: RealityNode, description: RealityDescription, nodes: RealityNode[]) => {
  if (description === 'dormant-reconstructable') {
    return { id: node.id, description, reconstructable: true as const, stub: true as const, mesh: false as const }
  }
  if (description === 'law') {
    return { id: node.id, description, temperatureK: node.temperatureK, formula: node.substanceId, phase: node.phase }
  }
  if (description === 'statistical') {
    const moles = (node.inventory ?? []).reduce((sum, part) => sum + part.moles, 0)
    return { id: node.id, description, moles, temperatureK: node.temperatureK }
  }
  if (description === 'continuum' || description === 'spectral-transport') {
    const light = transport({
      sourceEmission: solarSpectrum(),
      media: [{ substanceId: node.substanceId ?? 'N2', path: description === 'spectral-transport' ? 4 : 1 }],
      observer: 'human-photopic',
    })
    return { id: node.id, description, luminance: light.luminance, rayTraced: false as const, pbr: false as const }
  }
  if (description === 'discrete-body') {
    const needs = needsOf(node, nodes)
    return { id: node.id, description, needs, consciousnessClaim: false as const }
  }
  const climate = climateAt(nodes, centerOf(node))
  return { id: node.id, description, climate, interacting: true as const, framebuffer: false as const }
}

export const presentWorld = (nodes: RealityNode[], adaptations: Adaptation[]) => {
  const packets = adaptations.map(item => {
    const node = nodes.find(entry => entry.id === item.nodeId)
    if (!node) return { id: item.nodeId, description: item.description, missing: true as const }
    return presentNode(node, item.description, nodes)
  })
  return {
    packets,
    framebufferFoundation: false as const,
    meshIsFoundation: false as const,
    pbrIsFoundation: false as const,
    ultraPreset: false as const,
  }
}
