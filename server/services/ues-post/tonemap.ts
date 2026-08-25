import { clamp01, type V3 } from '../ues-light/vec.js'

export const acesFilmic = (hdr: V3): V3 => {
  const map = (x: number) => {
    const a = 2.51
    const b = 0.03
    const c = 2.43
    const d = 0.59
    const e = 0.14
    return clamp01((x * (a * x + b)) / (x * (c * x + d) + e))
  }
  return [map(hdr[0]), map(hdr[1]), map(hdr[2])]
}

export const reinhard = (hdr: V3): V3 => [
  hdr[0] / (1 + hdr[0]),
  hdr[1] / (1 + hdr[1]),
  hdr[2] / (1 + hdr[2]),
]

export const encodeSrgb = (linear: V3): V3 => [
  linear[0] <= 0.0031308 ? 12.92 * linear[0] : 1.055 * linear[0] ** (1 / 2.4) - 0.055,
  linear[1] <= 0.0031308 ? 12.92 * linear[1] : 1.055 * linear[1] ** (1 / 2.4) - 0.055,
  linear[2] <= 0.0031308 ? 12.92 * linear[2] : 1.055 * linear[2] ** (1 / 2.4) - 0.055,
]
