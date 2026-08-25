import { inBounds } from '../ues-shared/math.js'

const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export const flowDirection = (heights: number[][]) => {
  const size = heights.length
  const dir: ([number, number] | null)[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => null))
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      let best: [number, number] | null = null
      let lowest = heights[z][x]
      for (const [dx, dz] of dirs) {
        const nx = x + dx
        const nz = z + dz
        if (!inBounds(nx, nz, size)) continue
        if (heights[nz][nx] < lowest) {
          lowest = heights[nz][nx]
          best = [nx, nz]
        }
      }
      dir[z][x] = best
    }
  }
  return dir
}

export const accumulate = (heights: number[][]) => {
  const size = heights.length
  const dir = flowDirection(heights)
  const acc = Array.from({ length: size }, () => Array.from({ length: size }, () => 1))
  const order = Array.from({ length: size * size }, (_, i) => [i % size, Math.floor(i / size)] as [number, number])
    .sort((a, b) => heights[b[1]][b[0]] - heights[a[1]][a[0]])
  for (const [x, z] of order) {
    const next = dir[z][x]
    if (!next) continue
    acc[next[1]][next[0]] += acc[z][x]
  }
  return { acc, dir }
}

export const rivers = (heights: number[][], acc: number[][], threshold = 8) => {
  const cells: [number, number][] = []
  for (let z = 0; z < heights.length; z++) {
    for (let x = 0; x < heights.length; x++) {
      if (heights[z][x] > 0 && acc[z][x] >= threshold) cells.push([x, z])
    }
  }
  return cells
}

export const lakes = (heights: number[][]) => {
  const size = heights.length
  const basins: [number, number][] = []
  for (let z = 1; z < size - 1; z++) {
    for (let x = 1; x < size - 1; x++) {
      if (heights[z][x] <= 0) continue
      if (dirs.every(([dx, dz]) => heights[z + dz][x + dx] >= heights[z][x])) basins.push([x, z])
    }
  }
  return basins
}
