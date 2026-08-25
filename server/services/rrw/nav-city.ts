import { contains } from './geometry.js'
import { composeWithStructures } from './structure.js'
import { centerOf } from './extent.js'
import type { RealityNode } from './types.js'

const size = 24
const origin = -12

const blocked = (nodes: RealityNode[], x: number, z: number) => {
  const point: [number, number, number] = [x, 0.35, z]
  return nodes.some(node => (node.id === 'outcrop' || node.id === 'fire' || node.id === 'tool') && contains(node.extent, point))
}

const toCell = (x: number, z: number): [number, number] => [
  Math.max(0, Math.min(size - 1, Math.round(x - origin))),
  Math.max(0, Math.min(size - 1, Math.round(z - origin))),
]

export const walkCity = (nodes: RealityNode[], startPoint?: [number, number], goalPoint?: [number, number]) => {
  const human = nodes.find(item => item.id === 'human')
  const tree = nodes.find(item => item.id === 'tree')
  const from = startPoint ?? (human ? [centerOf(human)[0], centerOf(human)[2]] as [number, number] : [0.4, 3.6])
  const to = goalPoint ?? (tree ? [centerOf(tree)[0], centerOf(tree)[2]] as [number, number] : [-2, 1])
  const start = toCell(from[0], from[1])
  const goal = toCell(to[0], to[1])
  const walkable: boolean[][] = []
  for (let z = 0; z < size; z++) {
    const row: boolean[] = []
    for (let x = 0; x < size; x++) row.push(!blocked(nodes, origin + x, origin + z))
    walkable.push(row)
  }
  const key = (cell: [number, number]) => `${cell[0]},${cell[1]}`
  const queue: [number, number][] = [start]
  const seen = new Set([key(start)])
  const came = new Map<string, [number, number]>()
  const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  while (queue.length) {
    const current = queue.shift()!
    if (current[0] === goal[0] && current[1] === goal[1]) break
    for (const [dx, dz] of dirs) {
      const next: [number, number] = [current[0] + dx, current[1] + dz]
      if (next[0] < 0 || next[1] < 0 || next[0] >= size || next[1] >= size) continue
      if (!walkable[next[1]][next[0]] || seen.has(key(next))) continue
      seen.add(key(next))
      came.set(key(next), current)
      queue.push(next)
    }
  }
  const path: [number, number][] = []
  let cursor: [number, number] | undefined = seen.has(key(goal)) ? goal : undefined
  while (cursor) {
    path.unshift(cursor)
    cursor = came.get(key(cursor))
  }
  return {
    size,
    walkable: walkable.flat().filter(Boolean).length,
    found: path.length > 0 && path[0][0] === start[0] && path[0][1] === start[1],
    length: path.length,
    start,
    goal,
    recast: false as const,
    meshNavIdentity: false as const,
  }
}

export const compareCityNav = (prompt = 'oceano salgado com um humano e um abrigo') =>
  walkCity(composeWithStructures(prompt).nodes)
