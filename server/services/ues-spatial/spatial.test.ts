import { describe, expect, it } from 'vitest'
import { spatialAdapters } from './adapters.js'
import { UesSpatialCore } from './core.js'

describe('UES spatial data adapters', () => {
  it('normalizes internal sources and keeps Google/NASA optional', () => {
    expect(spatialAdapters.every(item => !item.required)).toBe(true)
    const result = new UesSpatialCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.googleRequired).toBe(false)
    expect(result.worlds.local.tiles).toBeGreaterThan(1)
    expect(result.worlds.google.tiles).toBe(0)
  })
})
