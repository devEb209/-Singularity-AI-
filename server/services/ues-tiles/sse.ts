import { volumeSphere } from './bounds.js'
import { distance3 } from './coords.js'
import type { BoundingVolume, Camera } from './types.js'

export const screenSpaceError = (geometricError: number, distance: number, camera: Camera) => {
  const safeDistance = Math.max(camera.near, distance)
  const pixelSize = (2 * Math.tan((camera.fovY * Math.PI) / 360)) / Math.max(1, camera.viewportHeight)
  return geometricError / (safeDistance * pixelSize)
}

export const tileMetrics = (volume: BoundingVolume, geometricError: number, camera: Camera) => {
  const sphere = volumeSphere(volume)
  const distance = Math.max(0, distance3(camera.position, sphere.center) - sphere.radius)
  const sse = screenSpaceError(geometricError, distance, camera)
  return { distance, sse, center: sphere.center, radius: sphere.radius }
}

export const fidelityFromSse = (sse: number, maxSse: number): 'full' | 'simplified' | 'dormant' => {
  if (sse >= maxSse) return 'full'
  if (sse >= maxSse * 0.25) return 'simplified'
  return 'dormant'
}
