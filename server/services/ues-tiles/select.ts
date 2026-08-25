import { volumeVisible } from './frustum.js'
import { fidelityFromSse, tileMetrics } from './sse.js'
import type { Camera, SelectedTile, TileNode } from './types.js'

export const selectTiles = (root: TileNode, camera: Camera, maxSse = 16): SelectedTile[] => {
  const selected: SelectedTile[] = []
  const visit = (node: TileNode) => {
    if (!volumeVisible(node.boundingVolume, camera)) return
    const metrics = tileMetrics(node.boundingVolume, node.geometricError, camera)
    const refine = metrics.sse > maxSse && node.children.length > 0
    if (refine) {
      for (const child of node.children) visit(child)
      if (node.refine === 'ADD' && node.content) {
        selected.push({
          id: node.id,
          uri: node.content.uri,
          sse: Number(metrics.sse.toFixed(4)),
          distance: Number(metrics.distance.toFixed(3)),
          fidelity: fidelityFromSse(metrics.sse, maxSse),
        })
      }
      return
    }
    if (node.content || node.children.length === 0) {
      selected.push({
        id: node.id,
        uri: node.content?.uri,
        sse: Number(metrics.sse.toFixed(4)),
        distance: Number(metrics.distance.toFixed(3)),
        fidelity: fidelityFromSse(metrics.sse, maxSse),
      })
    }
  }
  visit(root)
  return selected
}

export const distantIds = (selected: SelectedTile[], keep: Set<string>) =>
  selected.filter(item => !keep.has(item.id) && item.fidelity === 'dormant').map(item => item.id)
