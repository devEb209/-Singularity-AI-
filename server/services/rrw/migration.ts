import { composeWithStructures } from './structure.js'
import { centerOf, distanceBetween } from './extent.js'
import type { RealityNode } from './types.js'

export const stepMigration = (nodes: RealityNode[]) => {
  const animal = nodes.find(item => item.id === 'animal')
  const tree = nodes.find(item => item.id === 'tree')
  const ocean = nodes.find(item => item.id === 'ocean')
  if (!animal || !tree || !ocean || !animal.extent.min || !animal.extent.max) {
    return { nodes, moved: false as const, recast: false as const }
  }
  const goal = distanceBetween(animal, tree) < distanceBetween(animal, ocean) ? tree : ocean
  const from = centerOf(animal)
  const to = centerOf(goal)
  const dir = [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
  const len = Math.hypot(dir[0], dir[1], dir[2]) || 1
  const step = 0.18
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
  return { nodes: next, moved: distanceBetween(after, goal) < distanceBetween(animal, goal), recast: false as const }
}

export const compareMigration = (prompt = 'floresta com um humano') => {
  const stepped = stepMigration(composeWithStructures(prompt).nodes)
  return { moved: stepped.moved, recast: stepped.recast }
}
