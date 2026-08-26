import { lastPlacedEvent } from './event-place.js'
import { walkCity } from './nav-city.js'
import { centerOf } from './extent.js'
import type { RealityNode } from './types.js'

export const walkToMemory = (nodes: RealityNode[]) => {
  const human = nodes.find(item => item.id === 'human')
  const memory = lastPlacedEvent(nodes)
  const tree = nodes.find(item => item.id === 'tree')
  const start: [number, number] = human ? [centerOf(human)[0], centerOf(human)[2]] : [0.4, 3.6]
  const goalPoint = memory.at ?? (tree ? centerOf(tree) : [-2, 1, 1])
  const goal: [number, number] = [goalPoint[0], goalPoint[2] ?? goalPoint[1]]
  const walked = walkCity(nodes, start, goal)
  return {
    ...walked,
    remembered: memory.found,
    statement: memory.statement,
    recast: false as const,
  }
}
