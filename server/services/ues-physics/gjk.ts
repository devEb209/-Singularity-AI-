import type { Convex, GjkResult } from './types.js'
import { cross, dot, len2, neg, sub, triple, type V3 } from './vec.js'

export const supportDiff = (a: Convex, b: Convex, dir: V3): V3 => sub(a.support(dir), b.support(neg(dir)))

const toward = (a: V3, b: V3) => dot(a, b) > 0

const perpendicular = (edge: V3): V3 => Math.abs(edge[0]) < 0.7 ? cross(edge, [1, 0, 0]) : cross(edge, [0, 1, 0])

const line = (simplex: V3[], dir: { v: V3 }) => {
  const a = simplex[simplex.length - 1]
  const b = simplex[simplex.length - 2]
  const ab = sub(b, a)
  const ao = neg(a)
  if (toward(ab, ao)) {
    const next = triple(ab, ao, ab)
    if (len2(next) < 1e-16) {
      if (dot(a, b) <= 1e-12) return true
      dir.v = perpendicular(ab)
      return false
    }
    dir.v = next
  } else {
    simplex.splice(0, simplex.length, a)
    dir.v = ao
  }
  return false
}

const triangle = (simplex: V3[], dir: { v: V3 }) => {
  const a = simplex[2]
  const b = simplex[1]
  const c = simplex[0]
  const ab = sub(b, a)
  const ac = sub(c, a)
  const ao = neg(a)
  const abc = cross(ab, ac)
  if (toward(cross(abc, ac), ao)) {
    if (toward(ac, ao)) {
      simplex.splice(0, simplex.length, c, a)
      dir.v = triple(ac, ao, ac)
    } else {
      simplex.splice(0, simplex.length, b, a)
      return line(simplex, dir)
    }
  } else if (toward(cross(ab, abc), ao)) {
    simplex.splice(0, simplex.length, b, a)
    return line(simplex, dir)
  } else if (toward(abc, ao)) dir.v = abc
  else {
    simplex.splice(0, simplex.length, b, c, a)
    dir.v = neg(abc)
  }
  return false
}

const tetra = (simplex: V3[], dir: { v: V3 }) => {
  const a = simplex[3]
  const b = simplex[2]
  const c = simplex[1]
  const d = simplex[0]
  const ab = sub(b, a)
  const ac = sub(c, a)
  const ad = sub(d, a)
  const ao = neg(a)
  const abc = cross(ab, ac)
  const acd = cross(ac, ad)
  const adb = cross(ad, ab)
  if (toward(abc, ao)) {
    simplex.splice(0, simplex.length, c, b, a)
    return triangle(simplex, dir)
  }
  if (toward(acd, ao)) {
    simplex.splice(0, simplex.length, d, c, a)
    return triangle(simplex, dir)
  }
  if (toward(adb, ao)) {
    simplex.splice(0, simplex.length, b, d, a)
    return triangle(simplex, dir)
  }
  return true
}

export const gjk = (a: Convex, b: Convex, maxIter = 40): GjkResult => {
  let dir = sub(b.center, a.center)
  if (len2(dir) < 1e-18) dir = [1, 0, 0]
  const simplex: V3[] = [supportDiff(a, b, dir)]
  const holder = { v: neg(simplex[0]) }
  for (let i = 0; i < maxIter; i++) {
    const point = supportDiff(a, b, holder.v)
    if (dot(point, holder.v) < 0) return { hit: false, simplex, iterations: i + 1 }
    simplex.push(point)
    const enclosed = simplex.length === 2 ? line(simplex, holder) : simplex.length === 3 ? triangle(simplex, holder) : tetra(simplex, holder)
    if (enclosed) return { hit: true, simplex, iterations: i + 1 }
    if (len2(holder.v) < 1e-18) return { hit: true, simplex, iterations: i + 1 }
  }
  return { hit: false, simplex, iterations: maxIter }
}
