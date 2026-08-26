import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import type { RealityNode } from './types.js'

export const stepStormSurge = (nodes: RealityNode[]) => {
  const before = waterMoles(nodes)
  const next = nodes.map(node => {
    if (node.id !== 'ocean' || !node.extent.min || !node.extent.max) return node
    return {
      ...node,
      extent: {
        ...node.extent,
        max: [node.extent.max[0], node.extent.max[1] + 0.35, node.extent.max[2]] as [number, number, number],
      },
      pressurePa: node.pressurePa + 400,
    }
  })
  const beforeH = nodes.find(item => item.id === 'ocean')?.extent.max?.[1] ?? 0
  const afterH = next.find(item => item.id === 'ocean')?.extent.max?.[1] ?? 0
  return {
    nodes: next,
    before,
    after: waterMoles(next),
    conserved: Math.abs(waterMoles(next) - before) < 1e-9,
    risen: afterH > beforeH,
    shaderTide: false as const,
  }
}

export const compareStormSurge = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepStormSurge(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, risen: stepped.risen, shaderTide: stepped.shaderTide }
}
