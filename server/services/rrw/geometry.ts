import type { RealityExtent } from './types.js'

export const contains = (extent: RealityExtent, point: [number, number, number]) => {
  if (extent.kind === 'sphere' && extent.center && extent.radius !== undefined) {
    const dx = point[0] - extent.center[0]
    const dy = point[1] - extent.center[1]
    const dz = point[2] - extent.center[2]
    return dx * dx + dy * dy + dz * dz <= extent.radius * extent.radius
  }
  if (extent.kind === 'box' && extent.min && extent.max) {
    return point[0] >= extent.min[0] && point[0] <= extent.max[0]
      && point[1] >= extent.min[1] && point[1] <= extent.max[1]
      && point[2] >= extent.min[2] && point[2] <= extent.max[2]
  }
  if (extent.kind === 'implicit' && extent.field === 'plane' && extent.center) return point[1] <= (extent.center[1] ?? 0)
  return false
}

export const exportCompatibilityMesh = (extent: RealityExtent) => ({
  format: 'compatibility-mesh-port',
  kind: extent.kind,
  foundation: false as const,
  traditionalAsset: false as const,
  note: 'Mesh is an optional export port, not the RRW source of truth',
})
