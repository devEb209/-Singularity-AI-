import type { Texture2D } from './types.js'
import { sampleBilinear } from './sample.js'

export const buildMips = (base: Texture2D): Texture2D[] => {
  const chain = [base]
  let current = base
  while (current.width > 1 && current.height > 1) {
    const width = Math.max(1, Math.floor(current.width / 2))
    const height = Math.max(1, Math.floor(current.height / 2))
    const pixels = new Float32Array(width * height * 3)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = sampleBilinear(current, (x + 0.5) / width, (y + 0.5) / height, 'clamp')
        const index = (y * width + x) * 3
        pixels[index] = color[0]
        pixels[index + 1] = color[1]
        pixels[index + 2] = color[2]
      }
    }
    current = { width, height, pixels }
    chain.push(current)
  }
  return chain
}

export const sampleMip = (chain: Texture2D[], u: number, v: number, lod: number) => {
  const level = Math.max(0, Math.min(chain.length - 1, lod))
  const lo = chain[Math.floor(level)]
  const hi = chain[Math.min(chain.length - 1, Math.ceil(level))]
  const a = sampleBilinear(lo, u, v)
  if (lo === hi) return a
  const b = sampleBilinear(hi, u, v)
  const t = level - Math.floor(level)
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] as [number, number, number]
}
