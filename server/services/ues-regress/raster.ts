import { sample, type GrayImage } from '../ues-image/filters.js'

export const scene = (kind: 'base' | 'shift' | 'corrupt', size = 32): GrayImage =>
  sample(size, size, (x, y) => {
    const dx = kind === 'shift' ? 1 : 0
    const gx = (x - 16 - dx) / 14
    const gy = (y - 16) / 14
    const blob = Math.exp(-(gx * gx + gy * gy) * 2.4)
    const noise = kind === 'corrupt' ? ((x * 17 + y * 11) % 13) / 13 : 0
    return Math.min(1, kind === 'corrupt' ? noise : blob)
  })
