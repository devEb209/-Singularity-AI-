import { scaleOf } from '../rrw/spacetime.js'
import { realityLayers } from './catalog.js'
import type { LayerEntity, LayerId } from './types.js'

export const inspectLayer = (entities: LayerEntity[], layer: LayerId) => {
  const spec = realityLayers.find(item => item.id === layer)
  const items = entities.filter(item => item.layer === layer)
  return {
    layer,
    name: spec?.name ?? 'unknown',
    topics: spec?.topics ?? [],
    count: items.length,
    items: items.map(item => ({ id: item.id, label: item.label, kind: item.kind, description: item.description })),
    emptyDeleted: false as const,
  }
}

export const inspectEntity = (entities: LayerEntity[], id: string) => {
  const found = entities.find(item => item.id === id)
  return {
    found: Boolean(found),
    entity: found ?? null,
    consciousnessClaim: false as const,
  }
}

export const cameraScale = (meters: number) => ({
  band: scaleOf(meters),
  canEnter: true as const,
  framebufferFoundation: false as const,
})
