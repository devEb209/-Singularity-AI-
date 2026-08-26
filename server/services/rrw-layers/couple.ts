import { realityLayers } from './catalog.js'
import type { LayerLink } from './types.js'

export const coupleAdjacent = () => {
  const links: LayerLink[] = []
  for (let i = 0; i < realityLayers.length - 1; i++) {
    const lower = realityLayers[i]
    const upper = realityLayers[i + 1]
    links.push({ from: `layer-${lower.id}`, to: `layer-${upper.id}`, kind: 'emerges-from', bidirectional: true })
    links.push({ from: `layer-${upper.id}`, to: `layer-${lower.id}`, kind: 'constrains', bidirectional: true })
  }
  return {
    links,
    bidirectional: links.every(item => item.bidirectional),
    isolatedLayers: false as const,
    count: links.length,
  }
}

export const coupleEntities = (ids: string[]) => {
  const links: LayerLink[] = []
  for (let i = 0; i < ids.length - 1; i++) {
    links.push({ from: ids[i], to: ids[i + 1], kind: 'exchanges', bidirectional: true })
  }
  return links
}
