import { createHash } from 'node:crypto'
import { acesFilmic, encodeSrgb } from '../ues-post/tonemap.js'
import { clamp01 } from '../ues-light/vec.js'

export const toneMapFrame = (hdr: Float32Array) => {
  const ldr = new Float32Array(hdr.length)
  for (let i = 0; i < hdr.length; i += 3) {
    const mapped = encodeSrgb(acesFilmic([hdr[i], hdr[i + 1], hdr[i + 2]]))
    ldr[i] = clamp01(mapped[0])
    ldr[i + 1] = clamp01(mapped[1])
    ldr[i + 2] = clamp01(mapped[2])
  }
  return ldr
}

export const encodePreview = (ldr: Float32Array, width: number, height: number) => {
  const bytes = Buffer.alloc(width * height * 3)
  for (let i = 0; i < width * height; i++) {
    bytes[i * 3] = Math.round(ldr[i * 3] * 255)
    bytes[i * 3 + 1] = Math.round(ldr[i * 3 + 1] * 255)
    bytes[i * 3 + 2] = Math.round(ldr[i * 3 + 2] * 255)
  }
  return {
    width,
    height,
    encoding: 'srgb8-base64' as const,
    data: bytes.toString('base64'),
    bytes: bytes.length,
    checksum: createHash('sha256').update(bytes).digest('hex'),
  }
}

export const checksumHdr = (hdr: Float32Array) =>
  createHash('sha256').update(Buffer.from(hdr.buffer, hdr.byteOffset, hdr.byteLength)).digest('hex')
