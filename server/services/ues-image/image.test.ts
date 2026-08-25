import { describe, expect, it } from 'vitest'
import { UesImageCore } from './core.js'
import { bilinear, downsample, psnr, sample } from './filters.js'
import { interpolate } from './frameflow.js'

describe('UES image reconstruction', () => {
  it('reconstructs a downsampled field with measurable PSNR', () => {
    const native = sample(16, 16, (x, y) => (x + y) / 30)
    const recon = bilinear(downsample(native, 2), 16, 16)
    expect(psnr(native, recon)).toBeGreaterThan(20)
  })

  it('interpolates two frames without claiming a learned model', () => {
    const a = sample(12, 12, (x, y) => x / 12)
    const b = sample(12, 12, (x, y) => (x + 1) / 13)
    expect(interpolate(a, b).pixels).toHaveLength(144)
    const result = new UesImageCore().process()
    expect(result.verification.learned).toBe(false)
    expect(result.verification.valid).toBe(true)
  })
})
