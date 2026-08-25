import { describe, expect, it } from 'vitest'
import { UesStreamCore } from './core.js'
import { tickResidency } from './residency.js'

describe('UES chunk residency', () => {
  it('keeps a small move resident and evicts when the viewer jumps', () => {
    const first = tickResidency([], 64, 8, [32, 32], 12, 20, 16)
    expect(first.resident.length).toBeGreaterThan(0)
    expect(first.resident.length).toBeLessThanOrEqual(16)
    const near = tickResidency(first.resident, 64, 8, [33, 32], 12, 20, 16)
    expect(near.unloaded).toHaveLength(0)
    const far = tickResidency(near.resident, 64, 8, [56, 56], 12, 20, 16)
    expect(far.loaded.length).toBeGreaterThan(0)
    expect(far.unloaded.length).toBeGreaterThan(0)
    expect(far.resident.length).toBeLessThanOrEqual(16)
    expect(new UesStreamCore().process().verification.valid).toBe(true)
  })
})
