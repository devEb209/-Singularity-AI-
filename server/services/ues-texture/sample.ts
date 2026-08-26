import type { Texture2D, WrapMode } from './types.js'

const wrap = (value: number, size: number, mode: WrapMode) => {
  if (mode === 'clamp') return Math.max(0, Math.min(size - 1, value))
  const tiled = ((value % size) + size) % size
  return tiled
}

const texel = (texture: Texture2D, x: number, y: number, mode: WrapMode) => {
  const ix = wrap(x, texture.width, mode)
  const iy = wrap(y, texture.height, mode)
  const index = (iy * texture.width + ix) * 3
  return [texture.pixels[index], texture.pixels[index + 1], texture.pixels[index + 2]] as [number, number, number]
}

export const sampleBilinear = (texture: Texture2D, u: number, v: number, mode: WrapMode = 'repeat'): [number, number, number] => {
  const x = u * texture.width - 0.5
  const y = v * texture.height - 0.5
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const c00 = texel(texture, x0, y0, mode)
  const c10 = texel(texture, x0 + 1, y0, mode)
  const c01 = texel(texture, x0, y0 + 1, mode)
  const c11 = texel(texture, x0 + 1, y0 + 1, mode)
  return [
    c00[0] * (1 - fx) * (1 - fy) + c10[0] * fx * (1 - fy) + c01[0] * (1 - fx) * fy + c11[0] * fx * fy,
    c00[1] * (1 - fx) * (1 - fy) + c10[1] * fx * (1 - fy) + c01[1] * (1 - fx) * fy + c11[1] * fx * fy,
    c00[2] * (1 - fx) * (1 - fy) + c10[2] * fx * (1 - fy) + c01[2] * (1 - fx) * fy + c11[2] * fx * fy,
  ]
}

export const checker = (size = 8, a: [number, number, number] = [0.62, 0.48, 0.28], b: [number, number, number] = [0.28, 0.22, 0.16]): Texture2D => {
  const pixels = new Float32Array(size * size * 3)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = ((x ^ y) & 1) === 0 ? a : b
      const index = (y * size + x) * 3
      pixels[index] = color[0]
      pixels[index + 1] = color[1]
      pixels[index + 2] = color[2]
    }
  }
  return { width: size, height: size, pixels }
}
