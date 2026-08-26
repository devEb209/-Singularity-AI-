import { describe, expect, it } from 'vitest'
import { UesRasterCore } from './core.js'
import { checksum, createFramebuffer } from './framebuffer.js'
import { rasterTriangle } from './triangle.js'

describe('UES real software raster', () => {
  it('writes pixels, honors depth and stays deterministic without WebGPU', () => {
    const frame = createFramebuffer(8, 8)
    const far = rasterTriangle(frame,
      { x: 0, y: 0, z: 0.8, r: 1, g: 0, b: 0 },
      { x: 7, y: 0, z: 0.8, r: 1, g: 0, b: 0 },
      { x: 0, y: 7, z: 0.8, r: 1, g: 0, b: 0 },
    )
    const near = rasterTriangle(frame,
      { x: 1, y: 1, z: 0.2, r: 0, g: 0, b: 1 },
      { x: 4, y: 1, z: 0.2, r: 0, g: 0, b: 1 },
      { x: 1, y: 4, z: 0.2, r: 0, g: 0, b: 1 },
    )
    expect(far.fragments).toBeGreaterThan(near.fragments)
    expect(near.fragments).toBeGreaterThan(0)
    expect(frame.color[1 * 8 * 3 + 1 * 3 + 2]).toBeGreaterThan(0.5)
    const copy = createFramebuffer(8, 8)
    rasterTriangle(copy, { x: 0, y: 0, z: 0.8, r: 1, g: 0, b: 0 }, { x: 7, y: 0, z: 0.8, r: 1, g: 0, b: 0 }, { x: 0, y: 7, z: 0.8, r: 1, g: 0, b: 0 })
    rasterTriangle(copy, { x: 1, y: 1, z: 0.2, r: 0, g: 0, b: 1 }, { x: 4, y: 1, z: 0.2, r: 0, g: 0, b: 1 }, { x: 1, y: 4, z: 0.2, r: 0, g: 0, b: 1 })
    expect(checksum(frame)).toBe(checksum(copy))
    const result = new UesRasterCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.webgpuRequired).toBe(false)
    expect(result.verification.hardwareGpu).toBe(false)
  })
})
