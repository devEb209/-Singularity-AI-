export type V3 = [number, number, number]
export type V4 = [number, number, number, number]
export type Mat4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
]

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
export const mul = (a: V3, b: V3): V3 => [a[0] * b[0], a[1] * b[1], a[2] * b[2]]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const length = (a: V3) => Math.hypot(a[0], a[1], a[2])
export const norm = (a: V3): V3 => {
  const len = length(a) || 1
  return [a[0] / len, a[1] / len, a[2] / len]
}
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
export const mix = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]
export const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
export const saturate = (a: V3): V3 => [clamp01(a[0]), clamp01(a[1]), clamp01(a[2])]
export const reflect = (i: V3, n: V3): V3 => sub(i, scale(n, 2 * dot(i, n)))
export const luminance = (a: V3) => 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
