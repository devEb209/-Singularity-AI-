import { chebyshev, inBounds, neighbors8, type Cell } from '../ues-shared/math.js'

export interface PathResult {
  path: Cell[]
  cost: number
  found: boolean
  expanded: number
}

const key = (cell: Cell) => `${cell[0]},${cell[1]}`

export const astar = (walkable: boolean[][], cost: number[][], start: Cell, goal: Cell): PathResult => {
  const size = walkable.length
  if (!inBounds(start[0], start[1], size) || !inBounds(goal[0], goal[1], size)) return { path: [], cost: Infinity, found: false, expanded: 0 }
  if (!walkable[start[1]][start[0]] || !walkable[goal[1]][goal[0]]) return { path: [], cost: Infinity, found: false, expanded: 0 }
  const open: { cell: Cell; f: number }[] = [{ cell: start, f: chebyshev(start, goal) }]
  const came = new Map<string, Cell>()
  const gScore = new Map<string, number>([[key(start), 0]])
  const closed = new Set<string>()
  let expanded = 0
  while (open.length) {
    open.sort((a, b) => a.f - b.f)
    const current = open.shift()!
    const ck = key(current.cell)
    if (closed.has(ck)) continue
    closed.add(ck)
    expanded += 1
    if (current.cell[0] === goal[0] && current.cell[1] === goal[1]) {
      const path: Cell[] = [current.cell]
      let cursor = ck
      while (came.has(cursor)) {
        const prev = came.get(cursor)!
        path.push(prev)
        cursor = key(prev)
      }
      path.reverse()
      return { path, cost: gScore.get(ck) ?? Infinity, found: true, expanded }
    }
    for (const [dx, dz] of neighbors8) {
      const nx = current.cell[0] + dx
      const nz = current.cell[1] + dz
      if (!inBounds(nx, nz, size) || !walkable[nz][nx]) continue
      const step = (dx !== 0 && dz !== 0 ? 1.414 : 1) * Math.max(0.15, cost[nz][nx])
      const tentative = (gScore.get(ck) ?? Infinity) + step
      const nk = key([nx, nz])
      if (tentative >= (gScore.get(nk) ?? Infinity)) continue
      came.set(nk, current.cell)
      gScore.set(nk, tentative)
      open.push({ cell: [nx, nz], f: tentative + chebyshev([nx, nz], goal) })
    }
  }
  return { path: [], cost: Infinity, found: false, expanded }
}
