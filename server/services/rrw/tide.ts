import { composeReality } from './compose.js'
import type { RealityExtent, RealityNode } from './types.js'

const copyExtent = (extent: RealityExtent): RealityExtent => ({
  ...extent,
  center: extent.center ? [extent.center[0], extent.center[1], extent.center[2]] : undefined,
  min: extent.min ? [extent.min[0], extent.min[1], extent.min[2]] : undefined,
  max: extent.max ? [extent.max[0], extent.max[1], extent.max[2]] : undefined,
  of: extent.of ? [...extent.of] : undefined,
})

export const tideHeight = (moon: number) => 0.18 * Math.sin(2 * Math.PI * moon)

export const applyTide = (nodes: RealityNode[], baseExtent: RealityExtent, basePressure: number, moon: number) => {
  const height = tideHeight(moon)
  return nodes.map(node => {
    if (node.id !== 'ocean' || !baseExtent.max || !baseExtent.min) return node
    return {
      ...node,
      pressurePa: basePressure + height * 1800,
      extent: {
        ...copyExtent(baseExtent),
        min: [baseExtent.min[0], baseExtent.min[1], baseExtent.min[2]] as [number, number, number],
        max: [baseExtent.max[0], baseExtent.max[1] + height, baseExtent.max[2]] as [number, number, number],
      },
    }
  })
}

export const compareTides = (prompt = 'oceano salgado') => {
  const composed = composeReality(prompt)
  const ocean = composed.nodes.find(item => item.id === 'ocean')!
  const high = applyTide(composed.nodes, ocean.extent, ocean.pressurePa, 0.25)
  const low = applyTide(composed.nodes, ocean.extent, ocean.pressurePa, 0.75)
  const highY = high.find(item => item.id === 'ocean')!.extent.max![1]
  const lowY = low.find(item => item.id === 'ocean')!.extent.max![1]
  return {
    highY,
    lowY,
    highHigher: highY > lowY,
    shaderTide: false as const,
    meshWave: false as const,
  }
}
