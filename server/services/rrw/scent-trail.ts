import { composeWithStructures } from './structure.js'
import { centerOf, distanceBetween } from './extent.js'
import { scentAt } from './smell.js'
import type { RealityNode } from './types.js'

export const stepScentTrail = (nodes: RealityNode[]) => {
  const animal = nodes.find(item => item.id === 'animal')
  if (!animal || !animal.extent.min || !animal.extent.max) return { nodes, followed: false as const, recast: false as const }
  const sources = nodes.filter(item => item.id === 'tree' || item.id === 'ocean' || item.id === 'fire')
  const best = sources.sort((a, b) => scentAt(animal, b) - scentAt(animal, a))[0]
  if (!best) return { nodes, followed: false as const, recast: false as const }
  const from = centerOf(animal)
  const to = centerOf(best)
  const dir = [to[0] - from[0], 0, to[2] - from[2]]
  const len = Math.hypot(dir[0], dir[2]) || 1
  const step = 0.16
  const next = nodes.map(node => {
    if (node.id !== 'animal' || !node.extent.min || !node.extent.max) return node
    const dx = (dir[0] / len) * step
    const dz = (dir[2] / len) * step
    return {
      ...node,
      extent: {
        ...node.extent,
        min: [node.extent.min[0] + dx, node.extent.min[1], node.extent.min[2] + dz] as [number, number, number],
        max: [node.extent.max[0] + dx, node.extent.max[1], node.extent.max[2] + dz] as [number, number, number],
      },
    }
  })
  const after = next.find(item => item.id === 'animal')!
  return { nodes: next, followed: distanceBetween(after, best) < distanceBetween(animal, best), recast: false as const }
}

export const compareScentTrail = (prompt = 'floresta com um humano') => {
  const stepped = stepScentTrail(composeWithStructures(prompt).nodes)
  return { followed: stepped.followed, recast: stepped.recast }
}
