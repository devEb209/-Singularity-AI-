import { astar } from '../ues-nav/pathfind.js'
import { accumulate, rivers } from '../ues-planet/hydrology.js'
import { inBounds } from '../ues-shared/math.js'

export const slopeAt = (heights: number[][], x: number, z: number) => {
  const size = heights.length
  let max = 0
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][]) {
    const nx = x + dx
    const nz = z + dz
    if (!inBounds(nx, nz, size)) continue
    max = Math.max(max, Math.abs(heights[nz][nx] - heights[z][x]))
  }
  return max
}

export const walkableFromPlanet = (heights: number[][], maxSlope = 0.22) => {
  const { acc } = accumulate(heights)
  const river = new Set(rivers(heights, acc).map(([x, z]) => `${x},${z}`))
  const walkable = heights.map((row, z) => row.map((height, x) => height > 0 && !river.has(`${x},${z}`) && slopeAt(heights, x, z) < maxSlope))
  const cost = walkable.map((row, z) => row.map((cell, x) => {
    if (!cell) return 99
    return 1 + slopeAt(heights, x, z) * 4
  }))
  const cells = walkable.flat().filter(Boolean).length
  return { walkable, cost, cells, rivers: river.size }
}

export const firstLastLand = (walkable: boolean[][]) => {
  let start: [number, number] | undefined
  for (let z = 0; z < walkable.length; z++) {
    for (let x = 0; x < walkable[z].length; x++) {
      if (walkable[z][x]) {
        start = [x, z]
        break
      }
    }
    if (start) break
  }
  if (!start) return { start: [0, 0] as [number, number], goal: [0, 0] as [number, number] }
  const seen = new Set<string>([`${start[0]},${start[1]}`])
  const queue: [number, number][] = [start]
  let goal = start
  while (queue.length) {
    const [x, z] = queue.shift()!
    goal = [x, z]
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][]) {
      const nx = x + dx
      const nz = z + dz
      const key = `${nx},${nz}`
      if (!inBounds(nx, nz, walkable.length) || !walkable[nz][nx] || seen.has(key)) continue
      seen.add(key)
      queue.push([nx, nz])
    }
  }
  return { start, goal }
}

export const pathPlanet = (heights: number[][]) => {
  const layer = walkableFromPlanet(heights)
  const { start, goal } = firstLastLand(layer.walkable)
  const path = astar(layer.walkable, layer.cost, start, goal)
  return { ...layer, start, goal, path }
}
