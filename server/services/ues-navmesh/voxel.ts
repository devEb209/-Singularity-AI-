import type { Mesh, VoxelGrid } from './types.js'

const idx = (dim: [number, number, number], x: number, y: number, z: number) => x + dim[0] * (y + dim[1] * z)

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const roomWithObstacle = (): Mesh => {
  const floor: Mesh['vertices'] = [[-4, 0, -4], [4, 0, -4], [4, 0, 4], [-4, 0, 4]]
  const box: Mesh['vertices'] = []
  for (const y of [0, 1.2]) for (const z of [-0.7, 0.7]) for (const x of [-0.7, 0.7]) box.push([x, y, z])
  const vertices = [...floor, ...box]
  const triangles: Mesh['triangles'] = [
    [0, 1, 2], [0, 2, 3],
    [4, 5, 7], [4, 7, 6],
    [8, 10, 11], [8, 11, 9],
    [4, 6, 10], [4, 10, 8],
    [5, 9, 11], [5, 11, 7],
    [4, 8, 9], [4, 9, 5],
    [6, 7, 11], [6, 11, 10],
  ]
  return { vertices, triangles }
}

export const voxelize = (mesh: Mesh, origin: [number, number, number] = [-4, -0.05, -4], cell = 0.4, dim: [number, number, number] = [20, 6, 20]): VoxelGrid => {
  const occupied = new Uint8Array(dim[0] * dim[1] * dim[2])
  for (const [i0, i1, i2] of mesh.triangles) {
    const a = mesh.vertices[i0]
    const b = mesh.vertices[i1]
    const c = mesh.vertices[i2]
    const minX = Math.min(a[0], b[0], c[0])
    const minY = Math.min(a[1], b[1], c[1])
    const minZ = Math.min(a[2], b[2], c[2])
    const maxX = Math.max(a[0], b[0], c[0])
    const maxY = Math.max(a[1], b[1], c[1])
    const maxZ = Math.max(a[2], b[2], c[2])
    const x0 = clamp(Math.floor((minX - origin[0]) / cell), 0, dim[0] - 1)
    const y0 = clamp(Math.floor((minY - origin[1]) / cell), 0, dim[1] - 1)
    const z0 = clamp(Math.floor((minZ - origin[2]) / cell), 0, dim[2] - 1)
    const x1 = clamp(Math.floor((maxX - origin[0]) / cell), 0, dim[0] - 1)
    const y1 = clamp(Math.floor((maxY - origin[1]) / cell), 0, dim[1] - 1)
    const z1 = clamp(Math.floor((maxZ - origin[2]) / cell), 0, dim[2] - 1)
    for (let z = z0; z <= z1; z++) {
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) occupied[idx(dim, x, y, z)] = 1
      }
    }
  }
  return { origin, cell, dim, occupied }
}

export const occupiedAt = (grid: VoxelGrid, x: number, y: number, z: number) => {
  if (x < 0 || y < 0 || z < 0 || x >= grid.dim[0] || y >= grid.dim[1] || z >= grid.dim[2]) return false
  return grid.occupied[idx(grid.dim, x, y, z)] === 1
}

export const fillAabb = (grid: VoxelGrid, min: [number, number, number], max: [number, number, number]) => {
  const x0 = clamp(Math.floor((min[0] - grid.origin[0]) / grid.cell), 0, grid.dim[0] - 1)
  const y0 = clamp(Math.floor((min[1] - grid.origin[1]) / grid.cell), 0, grid.dim[1] - 1)
  const z0 = clamp(Math.floor((min[2] - grid.origin[2]) / grid.cell), 0, grid.dim[2] - 1)
  const x1 = clamp(Math.floor((max[0] - grid.origin[0]) / grid.cell), 0, grid.dim[0] - 1)
  const y1 = clamp(Math.floor((max[1] - grid.origin[1]) / grid.cell), 0, grid.dim[1] - 1)
  const z1 = clamp(Math.floor((max[2] - grid.origin[2]) / grid.cell), 0, grid.dim[2] - 1)
  for (let z = z0; z <= z1; z++) {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) grid.occupied[idx(grid.dim, x, y, z)] = 1
    }
  }
  return grid
}
