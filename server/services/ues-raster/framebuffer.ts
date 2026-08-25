import { createHash } from 'node:crypto'
import type { Framebuffer } from './types.js'

export const createFramebuffer = (width: number, height: number): Framebuffer => ({
  width,
  height,
  color: new Float32Array(width * height * 3),
  depth: new Float32Array(width * height).fill(1),
  written: 0,
})

export const writePixel = (frame: Framebuffer, x: number, y: number, z: number, rgb: [number, number, number]) => {
  if (x < 0 || y < 0 || x >= frame.width || y >= frame.height) return false
  const index = y * frame.width + x
  if (z >= frame.depth[index]) return false
  frame.depth[index] = z
  const c = index * 3
  frame.color[c] = rgb[0]
  frame.color[c + 1] = rgb[1]
  frame.color[c + 2] = rgb[2]
  frame.written += 1
  return true
}

export const checksum = (frame: Framebuffer) =>
  createHash('sha256').update(Buffer.from(frame.color.buffer)).digest('hex')

export const coverage = (frame: Framebuffer) => Number((frame.written / (frame.width * frame.height)).toFixed(4))
