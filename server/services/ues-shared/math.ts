export type Cell = [number, number]
export type Vec2 = [number, number]
export type Vec3 = [number, number, number]

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const hashSeed = (text: string) => {
  let h = 2166136261
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619)
  return h >>> 0
}

export const rng = (seed: number) => () => {
  seed = Math.imul(seed ^ seed >>> 15, 1 | seed)
  seed ^= seed + Math.imul(seed ^ seed >>> 7, 61 | seed)
  return ((seed ^ seed >>> 14) >>> 0) / 4294967296
}

export const inBounds = (x: number, z: number, size: number) => x >= 0 && z >= 0 && x < size && z < size

export const neighbors8: Cell[] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1],
]

export const manhattan = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
export const chebyshev = (a: Cell, b: Cell) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]))
export const hypot2 = (a: Cell, b: Cell) => Math.hypot(a[0] - b[0], a[1] - b[1])
