import { describe, expect, it } from 'vitest'
import { hashSeed } from '../ues-shared/math.js'
import { heightField } from '../ues-planet/height.js'
import { UesFnwsCore } from './core.js'
import { flow, initWater, volume } from './cycle.js'
import { pressure } from './waves.js'

describe('UES FNWS water', () => {
  it('conserves volume without rain/evap and drains a highland dump', () => {
    const heights = heightField(hashSeed('earth-like'), 36)
    const water = initWater(heights)
    const next = flow(heights, flow(heights, water.map(row => row.slice())))
    expect(Math.abs(volume(water) - volume(next))).toBeLessThan(1e-6)
    expect(pressure(1)).toBeGreaterThan(9000)
    const result = new UesFnwsCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.levels.near).toBe('detailed')
    expect(result.levels.far).not.toBe('detailed')
  })
})
