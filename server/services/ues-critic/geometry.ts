import { inspect } from '../ues-retopo/inspect.js'
import type { CriticMesh, GeometryReport, Tri, V3 } from './types.js'

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]

const faceVerts = (mesh: CriticMesh, face: Tri): [V3, V3, V3] => [mesh.vertices[face[0]], mesh.vertices[face[1]], mesh.vertices[face[2]]]

export const signedVolume = (mesh: CriticMesh) => {
  let volume = 0
  for (const face of mesh.triangles) {
    const [a, b, c] = faceVerts(mesh, face)
    volume += dot(a, cross(b, c))
  }
  return volume / 6
}

export const triangleMetrics = (mesh: CriticMesh) => {
  let skinny = 0
  let minArea = Infinity
  let maxAspect = 0
  for (const face of mesh.triangles) {
    const [a, b, c] = faceVerts(mesh, face)
    const ab = Math.hypot(...sub(b, a))
    const bc = Math.hypot(...sub(c, b))
    const ca = Math.hypot(...sub(a, c))
    const area = 0.5 * Math.hypot(...cross(sub(b, a), sub(c, a)))
    const minEdge = Math.min(ab, bc, ca)
    const aspect = minEdge > 1e-10 ? Math.max(ab, bc, ca) / minEdge : Infinity
    if (area < 1e-10 || aspect > 22) skinny += 1
    minArea = Math.min(minArea, area)
    if (Number.isFinite(aspect)) maxAspect = Math.max(maxAspect, aspect)
  }
  return { skinny, minArea: Number((minArea === Infinity ? 0 : minArea).toFixed(8)), maxAspect: Number(maxAspect.toFixed(4)) }
}

export const flippedNeighbors = (mesh: CriticMesh) => {
  const edgeFaces = new Map<string, number[]>()
  mesh.triangles.forEach((face, index) => {
    for (let i = 0; i < 3; i++) {
      const a = face[i]
      const b = face[(i + 1) % 3]
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      const list = edgeFaces.get(key) ?? []
      list.push(index)
      edgeFaces.set(key, list)
    }
  })
  const normal = (face: Tri) => {
    const [a, b, c] = faceVerts(mesh, face)
    return cross(sub(b, a), sub(c, a))
  }
  let flipped = 0
  for (const faces of edgeFaces.values()) {
    if (faces.length !== 2) continue
    if (dot(normal(mesh.triangles[faces[0]]), normal(mesh.triangles[faces[1]])) < 0) flipped += 1
  }
  return flipped
}

const aabb = (a: V3, b: V3, c: V3) => ({
  min: [Math.min(a[0], b[0], c[0]), Math.min(a[1], b[1], c[1]), Math.min(a[2], b[2], c[2])] as V3,
  max: [Math.max(a[0], b[0], c[0]), Math.max(a[1], b[1], c[1]), Math.max(a[2], b[2], c[2])] as V3,
})

const overlap = (a: ReturnType<typeof aabb>, b: ReturnType<typeof aabb>) =>
  a.min[0] <= b.max[0] && a.max[0] >= b.min[0] && a.min[1] <= b.max[1] && a.max[1] >= b.min[1] && a.min[2] <= b.max[2] && a.max[2] >= b.min[2]

const shareVertex = (a: Tri, b: Tri) => a.some(index => b.includes(index))

const segmentHitsTriangle = (p: V3, q: V3, a: V3, b: V3, c: V3) => {
  const e1 = sub(b, a)
  const e2 = sub(c, a)
  const dir = sub(q, p)
  const h = cross(dir, e2)
  const det = dot(e1, h)
  if (Math.abs(det) < 1e-10) return false
  const inv = 1 / det
  const s = sub(p, a)
  const u = inv * dot(s, h)
  if (u < 0 || u > 1) return false
  const qvec = cross(s, e1)
  const v = inv * dot(dir, qvec)
  if (v < 0 || u + v > 1) return false
  const t = inv * dot(e2, qvec)
  return t >= 1e-6 && t <= 1 - 1e-6
}

export const trianglesIntersect = (a0: V3, a1: V3, a2: V3, b0: V3, b1: V3, b2: V3) => {
  const aEdges: [V3, V3][] = [[a0, a1], [a1, a2], [a2, a0]]
  const bEdges: [V3, V3][] = [[b0, b1], [b1, b2], [b2, b0]]
  return aEdges.some(([p, q]) => segmentHitsTriangle(p, q, b0, b1, b2)) || bEdges.some(([p, q]) => segmentHitsTriangle(p, q, a0, a1, a2))
}

export const selfIntersections = (mesh: CriticMesh) => {
  const boxes = mesh.triangles.map(face => {
    const [a, b, c] = faceVerts(mesh, face)
    return aabb(a, b, c)
  })
  let count = 0
  for (let i = 0; i < mesh.triangles.length; i++) {
    for (let j = i + 1; j < mesh.triangles.length; j++) {
      if (shareVertex(mesh.triangles[i], mesh.triangles[j])) continue
      if (!overlap(boxes[i], boxes[j])) continue
      const [a0, a1, a2] = faceVerts(mesh, mesh.triangles[i])
      const [b0, b1, b2] = faceVerts(mesh, mesh.triangles[j])
      if (trianglesIntersect(a0, a1, a2, b0, b1, b2)) count += 1
    }
  }
  return count
}

export const bboxAspect = (mesh: CriticMesh) => {
  const min: V3 = [Infinity, Infinity, Infinity]
  const max: V3 = [-Infinity, -Infinity, -Infinity]
  for (const vertex of mesh.vertices) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], vertex[axis])
      max[axis] = Math.max(max[axis], vertex[axis])
    }
  }
  const extents = [max[0] - min[0], max[1] - min[1], max[2] - min[2]].map(value => Math.max(1e-6, value))
  return Number((Math.max(...extents) / Math.min(...extents)).toFixed(4))
}

export const geometryReport = (mesh: CriticMesh): GeometryReport => {
  const topology = inspect(mesh)
  const metrics = triangleMetrics(mesh)
  const volume = signedVolume(mesh)
  const flipped = flippedNeighbors(mesh)
  const intersections = selfIntersections(mesh)
  const aspect = bboxAspect(mesh)
  return {
    triangleCount: mesh.triangles.length,
    skinny: metrics.skinny,
    minArea: metrics.minArea,
    maxAspect: metrics.maxAspect,
    volume: Number(volume.toFixed(6)),
    flippedNeighbors: flipped,
    intersections,
    bboxAspect: aspect,
    valid: topology.valid && mesh.triangles.length > 0 && Math.abs(volume) > 1e-6 && intersections === 0 && metrics.skinny < mesh.triangles.length * 0.55,
  }
}

export const crossingFixture = (): CriticMesh => ({
  vertices: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0], [0.5, 0.2, -0.5], [0.5, 0.2, 0.5], [0.5, 0.8, 0]],
  triangles: [[0, 1, 2], [3, 4, 5]],
})

export const centroid = (mesh: CriticMesh): V3 => {
  const sum = mesh.vertices.reduce((acc, vertex) => add(acc, vertex), [0, 0, 0] as V3)
  return scale(sum, 1 / Math.max(1, mesh.vertices.length))
}
