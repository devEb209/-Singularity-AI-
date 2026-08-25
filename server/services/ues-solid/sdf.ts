import type { CsgOp, SolidPrimitive, V3 } from './types.js'

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

export const sdfBox = (point: V3, center: V3, half: V3) => {
  const d: V3 = [Math.abs(point[0] - center[0]) - half[0], Math.abs(point[1] - center[1]) - half[1], Math.abs(point[2] - center[2]) - half[2]]
  const outside = Math.hypot(Math.max(d[0], 0), Math.max(d[1], 0), Math.max(d[2], 0))
  return outside + Math.min(Math.max(d[0], d[1], d[2]), 0)
}

export const sdfSphere = (point: V3, center: V3, radius: number) => Math.hypot(...sub(point, center)) - radius

export const sdfCylinder = (point: V3, center: V3, radius: V3) => {
  const dxz = Math.hypot(point[0] - center[0], point[2] - center[2]) - radius[0]
  const dy = Math.abs(point[1] - center[1]) - radius[1]
  const outside = Math.hypot(Math.max(dxz, 0), Math.max(dy, 0))
  return outside + Math.min(Math.max(dxz, dy), 0)
}

export const sdfPrimitive = (point: V3, primitive: SolidPrimitive) => {
  if (primitive.kind === 'sphere') return sdfSphere(point, primitive.center, primitive.radius[0])
  if (primitive.kind === 'cylinder') return sdfCylinder(point, primitive.center, primitive.radius)
  return sdfBox(point, primitive.center, primitive.radius)
}

export const combineSdf = (a: number, b: number, op: CsgOp) => {
  if (op === 'subtract') return Math.max(a, -b)
  if (op === 'intersect') return Math.max(a, b)
  return Math.min(a, b)
}

export const evaluateTree = (point: V3, left: SolidPrimitive, right: SolidPrimitive, op: CsgOp) =>
  combineSdf(sdfPrimitive(point, left), sdfPrimitive(point, right), op)
