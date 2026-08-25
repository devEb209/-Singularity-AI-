import { clamp01 } from '../ues-light/vec.js'

export const extractBright = (hdr: Float32Array, width: number, height: number, threshold = 1.05) => {
  const bright = new Float32Array(hdr.length)
  for (let i = 0; i < width * height; i++) {
    const r = hdr[i * 3]
    const g = hdr[i * 3 + 1]
    const b = hdr[i * 3 + 2]
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    if (luma > threshold) {
      const t = clamp01((luma - threshold) / Math.max(0.2, luma))
      bright[i * 3] = r * t
      bright[i * 3 + 1] = g * t
      bright[i * 3 + 2] = b * t
    }
  }
  return bright
}

export const blur3 = (src: Float32Array, width: number, height: number) => {
  const out = new Float32Array(src.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0
      let g = 0
      let b = 0
      let w = 0
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const xx = Math.max(0, Math.min(width - 1, x + ox))
          const yy = Math.max(0, Math.min(height - 1, y + oy))
          const idx = (yy * width + xx) * 3
          const weight = ox === 0 && oy === 0 ? 4 : ox === 0 || oy === 0 ? 2 : 1
          r += src[idx] * weight
          g += src[idx + 1] * weight
          b += src[idx + 2] * weight
          w += weight
        }
      }
      const o = (y * width + x) * 3
      out[o] = r / w
      out[o + 1] = g / w
      out[o + 2] = b / w
    }
  }
  return out
}

export const compositeBloom = (hdr: Float32Array, bloom: Float32Array, amount = 0.18) => {
  const out = new Float32Array(hdr.length)
  for (let i = 0; i < hdr.length; i++) out[i] = hdr[i] + bloom[i] * amount
  return out
}
