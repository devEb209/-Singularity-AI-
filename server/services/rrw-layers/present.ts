import { realityLayers } from './catalog.js'
import type { LayerEntity } from './types.js'

export const presentLayers = (entities: LayerEntity[]) => {
  const packets = realityLayers.map(layer => ({
    layer: layer.id,
    name: layer.name,
    entities: entities.filter(item => item.layer === layer.id).length,
    description: layer.typicalDescription,
    deleted: false as const,
  }))
  return {
    packets,
    allPresent: packets.length === 30 && packets.every(item => item.deleted === false),
    framebufferFoundation: false as const,
    meshIsFoundation: false as const,
    realtimeClaim: false as const,
  }
}
