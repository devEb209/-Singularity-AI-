import { composeWithStructures } from './structure.js'
import { sumMoles } from './pool.js'
import type { RealityNode } from './types.js'

export const stepTectonics = (nodes: RealityNode[], slip = 0.04) => {
  const before = sumMoles(nodes, 'SiO2')
  const next = nodes.map(node => {
    if (node.id !== 'outcrop' || !node.extent.min || !node.extent.max) return node
    const dx = slip
    return {
      ...node,
      extent: {
        ...node.extent,
        min: [node.extent.min[0] + dx, node.extent.min[1], node.extent.min[2]] as [number, number, number],
        max: [node.extent.max[0] + dx, node.extent.max[1], node.extent.max[2]] as [number, number, number],
      },
    }
  })
  const beforeX = nodes.find(item => item.id === 'outcrop')?.extent.min?.[0] ?? 0
  const afterX = next.find(item => item.id === 'outcrop')?.extent.min?.[0] ?? 0
  return {
    nodes: next,
    conserved: Math.abs(sumMoles(next, 'SiO2') - before) < 1e-9,
    slipped: afterX > beforeX,
    plateSim: false as const,
  }
}

export const compareTectonics = (prompt = 'oceano salgado com rocha') => {
  const stepped = stepTectonics(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, slipped: stepped.slipped, plateSim: stepped.plateSim }
}
