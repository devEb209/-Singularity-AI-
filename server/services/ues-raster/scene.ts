import { evaluatePbr } from '../ues-gpu/kernels.js'
import type { ClipVertex } from './types.js'

export const unitQuad = (z = 0.4, rgb: [number, number, number] = [0.7, 0.2, 0.1]): ClipVertex[] => {
  const lit = evaluatePbr(rgb, 0.35, 0.05, 0.85)
  const [r, g, b] = lit
  return [
    { x: 2, y: 2, z, r, g, b },
    { x: 14, y: 2, z, r, g, b },
    { x: 14, y: 14, z, r, g, b },
    { x: 2, y: 14, z, r, g, b },
  ]
}

export const occluder = (): ClipVertex[] => [
  { x: 6, y: 6, z: 0.2, r: 0.1, g: 0.6, b: 0.9 },
  { x: 12, y: 6, z: 0.2, r: 0.1, g: 0.6, b: 0.9 },
  { x: 9, y: 12, z: 0.2, r: 0.1, g: 0.6, b: 0.9 },
]
