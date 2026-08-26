import { evaluateTree, sdfPrimitive } from './sdf.js'
import type { CsgOp, Occupancy, SolidMesh, SolidPrimitive, Tri, V3 } from './types.js'

const idx = (dim: number, x: number, y: number, z: number) => x + dim * (y + dim * z)

export const sampleOccupancy = (sdf: (point: V3) => number, origin: V3 = [-1.2, -1.2, -1.2], cell = 0.12, dim = 20): Occupancy => {
  const occupied = new Uint8Array(dim * dim * dim)
  let count = 0
  for (let z = 0; z < dim; z++) {
    for (let y = 0; y < dim; y++) {
      for (let x = 0; x < dim; x++) {
        const point: V3 = [origin[0] + (x + 0.5) * cell, origin[1] + (y + 0.5) * cell, origin[2] + (z + 0.5) * cell]
        if (sdf(point) < 0) {
          occupied[idx(dim, x, y, z)] = 1
          count += 1
        }
      }
    }
  }
  return { origin, cell, dim, occupied, count }
}

const faces: { dir: V3; corners: V3[] }[] = [
  { dir: [1, 0, 0], corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { dir: [-1, 0, 0], corners: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] },
  { dir: [0, 1, 0], corners: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]] },
  { dir: [0, -1, 0], corners: [[0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 0, 1]] },
  { dir: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { dir: [0, 0, -1], corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
]

const occupiedAt = (grid: Occupancy, x: number, y: number, z: number) => {
  if (x < 0 || y < 0 || z < 0 || x >= grid.dim || y >= grid.dim || z >= grid.dim) return false
  return grid.occupied[idx(grid.dim, x, y, z)] === 1
}

export const extractCuberille = (grid: Occupancy): SolidMesh => {
  const vertices: V3[] = []
  const triangles: Tri[] = []
  for (let z = 0; z < grid.dim; z++) {
    for (let y = 0; y < grid.dim; y++) {
      for (let x = 0; x < grid.dim; x++) {
        if (!occupiedAt(grid, x, y, z)) continue
        for (const face of faces) {
          if (occupiedAt(grid, x + face.dir[0], y + face.dir[1], z + face.dir[2])) continue
          const base = vertices.length
          for (const corner of face.corners) {
            vertices.push([
              grid.origin[0] + (x + corner[0]) * grid.cell,
              grid.origin[1] + (y + corner[1]) * grid.cell,
              grid.origin[2] + (z + corner[2]) * grid.cell,
            ])
          }
          triangles.push([base, base + 1, base + 2], [base, base + 2, base + 3])
        }
      }
    }
  }
  return { vertices, triangles }
}

export const booleanSolids = (left: SolidPrimitive, right: SolidPrimitive, op: CsgOp) => {
  const occupancy = sampleOccupancy(point => evaluateTree(point, left, right, op))
  const mesh = extractCuberille(occupancy)
  const leftOnly = sampleOccupancy(point => sdfPrimitive(point, left)).count
  const rightOnly = sampleOccupancy(point => sdfPrimitive(point, right)).count
  return {
    format: 'ues-solid-csg-v1' as const,
    op,
    occupancy,
    mesh: { vertices: mesh.vertices.length, triangles: mesh.triangles.length },
    geometry: mesh,
    counts: { result: occupancy.count, left: leftOnly, right: rightOnly },
    cellVolume: Number((occupancy.cell ** 3).toFixed(8)),
    volume: Number((occupancy.count * occupancy.cell ** 3).toFixed(6)),
  }
}

export const defaultPair = (): { left: SolidPrimitive; right: SolidPrimitive } => ({
  left: { id: 'block', kind: 'box', center: [0, 0, 0], radius: [0.7, 0.45, 0.7] },
  right: { id: 'cut', kind: 'sphere', center: [0.35, 0.15, 0], radius: [0.42, 0.42, 0.42] },
})
