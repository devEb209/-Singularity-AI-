import { composeWithStructures } from './structure.js'
import { centerOf } from './extent.js'
import type { RealityNode } from './types.js'

export const stepConvection = (nodes: RealityNode[], dt = 1) => {
  const ocean = nodes.find(item => item.id === 'ocean')
  const cloud = nodes.find(item => item.id === 'cloud')
  if (!ocean || !cloud || !cloud.extent.center) {
    return { nodes, lifted: false as const, shaderConvection: false as const }
  }
  const lift = ocean.temperatureK > cloud.temperatureK ? 0.08 * dt : -0.02 * dt
  const before = centerOf(cloud)[1]
  const next = nodes.map(node => {
    if (node.id !== 'cloud' || !node.extent.center) return node
    return {
      ...node,
      extent: {
        ...node.extent,
        center: [node.extent.center[0], node.extent.center[1] + lift, node.extent.center[2]] as [number, number, number],
      },
    }
  })
  const after = centerOf(next.find(item => item.id === 'cloud')!)[1]
  return { nodes: next, lifted: after > before, shaderConvection: false as const }
}

export const compareConvection = (prompt = 'oceano salgado sob céu nublado') => {
  const stepped = stepConvection(composeWithStructures(prompt).nodes)
  return { lifted: stepped.lifted, shaderConvection: stepped.shaderConvection }
}
