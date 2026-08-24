import { describe, expect, it } from 'vitest'
import { spatialize } from './hrtf.js'
import { loopSeam } from './loop.js'
import { loudness, mix, normalize, spatialGain, syncEvents, tone } from './mixer.js'

describe('UES audio mixer', () => {
  it('mixes clips, spatializes and refuses clipping after the gate', () => {
    const loud = tone(440, 0.1).map(value => value * 3)
    const mixed = mix([{ id: 'a', samples: loud, sampleRate: 8000, gain: 1, delay: 0 }])
    expect(mixed.verification.finite).toBe(true)
    expect(mixed.metrics.clipping).toBe(false)
    expect(loudness(normalize(loud)).clipping).toBe(false)
    expect(spatialGain([0, 0], [10, 0])).toBeLessThan(spatialGain([0, 0], [1, 0]))
    expect(syncEvents([{ tick: 2, clipId: 'a' }, { tick: 3, clipId: 'b' }], 2)).toHaveLength(1)
  })
})

describe('UES spatial audio and loop seams', () => {
  it('puts more energy on the left for a left source and reduces loop residual', () => {
    const wave = tone(330, 0.08)
    const left = spatialize(wave, -Math.PI / 2)
    const right = spatialize(wave, Math.PI / 2)
    expect(left.leftEnergy).toBeGreaterThan(left.rightEnergy)
    expect(right.rightEnergy).toBeGreaterThan(right.leftEnergy)
    expect(left.measuredHrtf).toBe(false)
    const seam = loopSeam(wave, 24)
    expect(seam.improved).toBe(true)
    expect(seam.after).toBeLessThanOrEqual(seam.raw + 1e-9)
  })
})
