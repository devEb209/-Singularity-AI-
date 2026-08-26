import { describe, expect, it } from 'vitest'
import { UesTextureCore } from './core.js'
import { buildMips } from './mip.js'
import { checker, sampleBilinear } from './sample.js'

describe('UES texture sampling', () => {
  it('bilinear-samples a checker and builds a mip chain without storing 16K', () => {
    const texture = checker(8)
    const a = sampleBilinear(texture, 0.0625, 0.0625)
    const b = sampleBilinear(texture, 0.1875, 0.0625)
    expect(Math.abs(a[0] - b[0])).toBeGreaterThan(0.15)
    const mips = buildMips(texture)
    expect(mips[0].width).toBe(8)
    expect(mips.at(-1)?.width).toBe(1)
    const result = new UesTextureCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.storedBitmap16k).toBe(false)
  })
})
