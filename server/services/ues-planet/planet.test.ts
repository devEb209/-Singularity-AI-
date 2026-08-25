import { describe, expect, it } from 'vitest'
import { hashSeed } from '../ues-shared/math.js'
import { UesPlanetCore } from './core.js'
import { classify, reconstruct } from './fidelity.js'
import { heightAt, heightField } from './height.js'
import { accumulate, rivers } from './hydrology.js'
import { observableCatalog } from './universe.js'

describe('UES planetary geophysics', () => {
  it('builds land, ocean and rivers and reconstructs a dormant cell', () => {
    const seed = hashSeed('earth-like')
    const heights = heightField(seed, 36)
    expect(heights.flat().some(h => h > 0)).toBe(true)
    expect(heights.flat().some(h => h <= 0)).toBe(true)
    const { acc } = accumulate(heights)
    expect(rivers(heights, acc).length).toBeGreaterThan(0)
    expect(reconstruct(seed, 4, 5, 36)).toBe(heightAt(seed, 4, 5, 36))
    expect(classify([18, 18], [18, 18])).toBe('full')
    expect(classify([0, 0], [18, 18])).toBe('dormant')
    expect(observableCatalog().verification.valid).toBe(true)
    expect(new UesPlanetCore().generate('earth-like', 36).verification.valid).toBe(true)
  })
})
