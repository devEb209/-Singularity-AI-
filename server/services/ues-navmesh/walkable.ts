import type { VoxelGrid } from './types.js'
import { occupiedAt } from './voxel.js'

export const walkableLayer = (grid: VoxelGrid, clearance = 2) => {
  const [sx, , sz] = grid.dim
  const walkable = Array.from({ length: sz }, () => Array.from({ length: sx }, () => false))
  let cells = 0
  for (let z = 0; z < sz; z++) {
    for (let x = 0; x < sx; x++) {
      let support = -1
      for (let y = 0; y <= 1; y++) {
        if (occupiedAt(grid, x, y, z)) support = y
      }
      if (support < 0) continue
      let clear = true
      for (let up = 1; up <= clearance; up++) {
        if (occupiedAt(grid, x, support + up, z)) clear = false
      }
      if (!clear) continue
      walkable[z][x] = true
      cells += 1
    }
  }
  const cost = walkable.map(row => row.map(cell => cell ? 1 : 99))
  return { walkable, cost, cells }
}

export const worldToCell = (grid: VoxelGrid, x: number, z: number): [number, number] => [
  Math.max(0, Math.min(grid.dim[0] - 1, Math.floor((x - grid.origin[0]) / grid.cell))),
  Math.max(0, Math.min(grid.dim[2] - 1, Math.floor((z - grid.origin[2]) / grid.cell))),
]
