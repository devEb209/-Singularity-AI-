import { boundaryLoops } from './inspect.js'
import type { Mesh, V3 } from './types.js'

const keyOf = (vertex: V3, epsilon: number) => vertex.map(value => Math.round(value / epsilon)).join(',')

export const weld = (mesh: Mesh, epsilon = 0.0008): Mesh => {
  const index = new Map<string, number>()
  const vertices: V3[] = []
  const remap = mesh.vertices.map(vertex => {
    const key = keyOf(vertex, epsilon)
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

export const fillHoles = (mesh: Mesh): Mesh => {
  const triangles = mesh.triangles.slice()
  for (const loop of boundaryLoops(triangles)) {
    const hub = loop[0]
    for (let i = 1; i < loop.length - 1; i++) triangles.push([hub, loop[i], loop[i + 1]])
  }
  return { vertices: mesh.vertices, triangles }
}

export const repair = (mesh: Mesh) => {
  const welded = weld(mesh)
  const filled = fillHoles(welded)
  return filled
}
