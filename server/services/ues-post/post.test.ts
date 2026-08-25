import { describe, expect, it } from 'vitest'
import { UesPostCore } from './core.js'
import { acesFilmic, encodeSrgb } from './tonemap.js'

describe('UES ACES post', () => {
  it('compresses HDR highlights and encodes sRGB without claiming DLSS', () => {
    const hot = acesFilmic([8, 8, 8])
    const mid = acesFilmic([0.18, 0.18, 0.18])
    expect(hot[0]).toBeLessThan(1.05)
    expect(hot[0]).toBeGreaterThan(mid[0])
    expect(encodeSrgb([0.18, 0.18, 0.18])[0]).toBeGreaterThan(0.18)
    const result = new UesPostCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.dlss).toBe(false)
    expect(result.bloomLeak).toBeGreaterThan(0)
  })
})
