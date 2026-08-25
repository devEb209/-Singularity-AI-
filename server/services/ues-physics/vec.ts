export type V3 = [number, number, number]

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const neg = (a: V3): V3 => [-a[0], -a[1], -a[2]]
export const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const len2 = (a: V3) => dot(a, a)
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2])
export const normalize = (a: V3): V3 => {
  const l = len(a)
  return l < 1e-12 ? [0, 0, 0] : scale(a, 1 / l)
}
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
export const triple = (a: V3, b: V3, c: V3): V3 => sub(scale(b, dot(a, c)), scale(a, dot(b, c)))
export const finite3 = (a: V3) => a.every(Number.isFinite)
