import { writePixel } from './framebuffer.js'
import type { ClipVertex, Framebuffer } from './types.js'

const edge = (a: ClipVertex, b: ClipVertex, x: number, y: number) =>
  (x - a.x) * (b.y - a.y) - (y - a.y) * (b.x - a.x)

export const rasterTriangle = (frame: Framebuffer, a: ClipVertex, b: ClipVertex, c: ClipVertex) => {
  const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)))
  const maxX = Math.min(frame.width - 1, Math.ceil(Math.max(a.x, b.x, c.x)))
  const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)))
  const maxY = Math.min(frame.height - 1, Math.ceil(Math.max(a.y, b.y, c.y)))
  const area = edge(a, b, c.x, c.y)
  if (Math.abs(area) < 1e-8) return { fragments: 0, occluded: 0 }
  let fragments = 0
  let occluded = 0
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = edge(b, c, x + 0.5, y + 0.5) / area
      const w1 = edge(c, a, x + 0.5, y + 0.5) / area
      const w2 = edge(a, b, x + 0.5, y + 0.5) / area
      if (w0 < 0 || w1 < 0 || w2 < 0) continue
      const z = w0 * a.z + w1 * b.z + w2 * c.z
      const rgb: [number, number, number] = [
        w0 * a.r + w1 * b.r + w2 * c.r,
        w0 * a.g + w1 * b.g + w2 * c.g,
        w0 * a.b + w1 * b.b + w2 * c.b,
      ]
      if (writePixel(frame, x, y, z, rgb)) fragments += 1
      else occluded += 1
    }
  }
  return { fragments, occluded }
}
