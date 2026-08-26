import { centerOf } from './extent.js'
import type { RealityNode } from './types.js'

export const windVector = (nodes: RealityNode[]): [number, number, number] => {
  const air = nodes.find(item => item.id === 'atmosphere')
  const storm = nodes.find(item => item.id === 'storm')
  const cloud = nodes.find(item => item.id === 'cloud')
  if (!air || !storm || !cloud) return [0, 0, 0]
  const from = centerOf(cloud)
  const toward = centerOf(storm)
  const delta: [number, number, number] = [toward[0] - from[0], toward[1] - from[1], toward[2] - from[2]]
  const length = Math.hypot(delta[0], delta[1], delta[2]) || 1
  const drive = (air.pressurePa - storm.pressurePa) / 80_000
  const scale = Math.max(-1.4, Math.min(1.4, drive))
  return [delta[0] / length * scale, delta[1] / length * scale * 0.25, delta[2] / length * scale]
}

export const displaceByWind = (node: RealityNode, wind: [number, number, number], dt = 1): RealityNode => {
  if (!node.extent.center) return node
  return {
    ...node,
    extent: {
      ...node.extent,
      center: [
        node.extent.center[0] + wind[0] * dt * 0.35,
        node.extent.center[1] + wind[1] * dt * 0.35,
        node.extent.center[2] + wind[2] * dt * 0.35,
      ],
    },
  }
}
