import { gjk, supportDiff } from './gjk.js'
import type { Convex, EpaContact } from './types.js'
import { cross, dot, len2, neg, scale, sub, type V3 } from './vec.js'

interface Face {
  verts: [V3, V3, V3]
  normal: V3
  distance: number
}

const keyOf = (a: V3, b: V3) => {
  const left = a.map(value => value.toFixed(5)).join(',')
  const right = b.map(value => value.toFixed(5)).join(',')
  return left < right ? `${left}|${right}` : `${right}|${left}`
}

const makeFace = (a: V3, b: V3, c: V3): Face | undefined => {
  const normalRaw = cross(sub(b, a), sub(c, a))
  const length = Math.sqrt(len2(normalRaw))
  if (length < 1e-12) return undefined
  let normal = scale(normalRaw, 1 / length)
  let distance = dot(normal, a)
  if (distance < 0) {
    normal = neg(normal)
    distance = -distance
    return { verts: [a, c, b], normal, distance }
  }
  return { verts: [a, b, c], normal, distance }
}

const tetraFaces = (points: V3[]) => {
  const combos: [V3, V3, V3][] = [
    [points[0], points[1], points[2]],
    [points[0], points[2], points[3]],
    [points[0], points[3], points[1]],
    [points[1], points[3], points[2]],
  ]
  return combos.map(([a, b, c]) => makeFace(a, b, c)).filter((face): face is Face => Boolean(face))
}

const expand = (faces: Face[], point: V3) => {
  const keep: Face[] = []
  const edges: [V3, V3][] = []
  for (const face of faces) {
    if (dot(face.normal, sub(point, face.verts[0])) > 1e-8) {
      edges.push([face.verts[0], face.verts[1]], [face.verts[1], face.verts[2]], [face.verts[2], face.verts[0]])
    } else keep.push(face)
  }
  const counts = new Map<string, { edge: [V3, V3]; count: number }>()
  for (const edge of edges) {
    const key = keyOf(edge[0], edge[1])
    const current = counts.get(key)
    if (current) current.count += 1
    else counts.set(key, { edge, count: 1 })
  }
  for (const { edge, count } of counts.values()) {
    if (count !== 1) continue
    const face = makeFace(edge[0], edge[1], point)
    if (face) keep.push(face)
  }
  return keep
}

export const ensureTetra = (simplex: V3[], a: Convex, b: Convex) => {
  const points = simplex.slice()
  const axes: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
  for (const axis of axes) {
    if (points.length >= 4) break
    const point = supportDiff(a, b, axis)
    if (points.every(existing => len2(sub(point, existing)) > 1e-8)) points.push(point)
  }
  if (points.length === 3) {
    const normal = cross(sub(points[1], points[0]), sub(points[2], points[0]))
    const up = supportDiff(a, b, normal)
    const down = supportDiff(a, b, neg(normal))
    const upVolume = Math.abs(dot(normal, sub(up, points[0])))
    const downVolume = Math.abs(dot(normal, sub(down, points[0])))
    points.push(upVolume >= downVolume ? up : down)
  }
  return points
}

export const epa = (a: Convex, b: Convex, simplex: V3[], maxIter = 28): EpaContact | undefined => {
  const points = ensureTetra(simplex, a, b)
  if (points.length < 4) return undefined
  let faces = tetraFaces(points.slice(0, 4))
  if (!faces.length) return undefined
  for (let i = 0; i < maxIter; i++) {
    faces.sort((left, right) => left.distance - right.distance)
    const closest = faces[0]
    const support = supportDiff(a, b, closest.normal)
    if (dot(support, closest.normal) - closest.distance < 1e-4) {
      return { normal: closest.normal, depth: closest.distance, iterations: i + 1 }
    }
    faces = expand(faces, support)
    if (!faces.length) return undefined
  }
  faces.sort((left, right) => left.distance - right.distance)
  return { normal: faces[0].normal, depth: faces[0].distance, iterations: maxIter }
}

export const contact = (a: Convex, b: Convex) => {
  const intersection = gjk(a, b)
  if (!intersection.hit) return { hit: false as const, gjk: intersection }
  const epaHit = epa(a, b, intersection.simplex)
  return { hit: true as const, gjk: intersection, epa: epaHit }
}
