import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import { molesOf, setMoles } from './extent.js'
import type { RealityNode } from './types.js'

export const stepFlood = (nodes: RealityNode[]) => {
  const loaded = nodes.map(node => (node.id === 'river' ? { ...node, inventory: setMoles(node.inventory ?? [], 'H2O', molesOf(node, 'H2O') + 40) } : node))
  const before = waterMoles(loaded)
  const river = loaded.find(item => item.id === 'river')
  const high = Boolean(river && molesOf(river, 'H2O') > 90)
  const next = loaded.map(node => {
    if (node.id !== 'river' || !node.extent.min || !node.extent.max || !high) return node
    return {
      ...node,
      extent: {
        ...node.extent,
        min: [node.extent.min[0] - 0.4, node.extent.min[1], node.extent.min[2]] as [number, number, number],
        max: [node.extent.max[0] + 0.4, node.extent.max[1] + 0.12, node.extent.max[2]] as [number, number, number],
      },
    }
  })
  return {
    nodes: next,
    before,
    after: waterMoles(next),
    conserved: Math.abs(waterMoles(next) - before) < 1e-9,
    flooded: high,
    shaderFlood: false as const,
  }
}

export const compareFlood = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepFlood(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, flooded: stepped.flooded, shaderFlood: stepped.shaderFlood }
}
