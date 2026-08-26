import { contains } from './geometry.js'
import { composeReality } from './compose.js'
import type { RealityNode } from './types.js'

const blocked = (nodes: RealityNode[], x: number, z: number) => {
  const point: [number, number, number] = [x, 0.35, z]
  return nodes.some(node => (node.id === 'outcrop' || node.id === 'fire' || node.id === 'tool') && contains(node.extent, point))
}

export const walkReality = (prompt = 'oceano salgado com um humano') => {
  const composed = composeReality(prompt)
  const size = 12
  const origin = -6
  const walkable: boolean[][] = []
  for (let z = 0; z < size; z++) {
    const row: boolean[] = []
    for (let x = 0; x < size; x++) row.push(!blocked(composed.nodes, origin + x, origin + z))
    walkable.push(row)
  }
  const start: [number, number] = [7, 9]
  const goal: [number, number] = [3, 7]
  const key = (c: [number, number]) => `${c[0]},${c[1]}`
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
    walkable: walkable.flat().filter(Boolean).length,
    found: path.length > 0 && path[0][0] === start[0],
    length: path.length,
    recast: false as const,
    meshNavIdentity: false as const,
  }
}
