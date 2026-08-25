import type { Mesh, V3 } from './types.js'

export const dominantAxis = (vertices: V3[]) => {
  const min: V3 = [Infinity, Infinity, Infinity]
  const max: V3 = [-Infinity, -Infinity, -Infinity]
  for (const vertex of vertices) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], vertex[axis])
      max[axis] = Math.max(max[axis], vertex[axis])
    }
  }
  const extent = max.map((value, axis) => value - min[axis])
  return extent.indexOf(Math.max(...extent))
}

export const remeshAlongFlow = (mesh: Mesh, partRanges: Record<string, [number, number]>, fine = 0.08, coarse = 0.22): Mesh => {
  const axisOf = new Array(mesh.vertices.length).fill(dominantAxis(mesh.vertices))
  for (const [start, end] of Object.values(partRanges)) {
    const slice = mesh.vertices.slice(start, end + 1)
    const axis = dominantAxis(slice)
    for (let i = start; i <= end && i < axisOf.length; i++) axisOf[i] = axis
  }
  const index = new Map<string, number>()
  const vertices: V3[] = []
  const remap = mesh.vertices.map((vertex, i) => {
    const axis = axisOf[i]
    const key = vertex.map((value, dim) => Math.round(value / (dim === axis ? fine : coarse))).join(',')
    const existing = index.get(key)
    if (existing !== undefined) return existing
    index.set(key, vertices.length)
    vertices.push(vertex)
    return vertices.length - 1
  })
  const triangles = mesh.triangles
    .map(face => face.map(i => remap[i]) as [number, number, number])
    .filter(face => new Set(face).size === 3)
  return { vertices, triangles }
}
