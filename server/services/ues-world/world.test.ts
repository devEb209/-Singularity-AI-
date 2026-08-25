import { describe, expect, it } from 'vitest'
import { UesWorldCore } from './core.js'
import { streamChunks } from './streaming.js'
import { generateTerrain } from './terrain.js'

describe('UES semantic world', () => {
  it('is deterministic and produces roads, settlements, vegetation and chunks', () => {
    const core = new UesWorldCore()
    const a = core.generate('coastal-city', 32, [10, 10])
    const b = core.generate('coastal-city', 32, [10, 10])
    expect(a.terrain.heights).toEqual(b.terrain.heights)
    expect(a.verification.valid).toBe(true)
    expect(a.settlements.length).toBeGreaterThan(0)
    expect(a.verification.buildings).toBeGreaterThan(0)
    expect(a.verification.roadCells).toBeGreaterThan(0)
    expect(a.roads.verification.connected).toBe(true)
    expect(a.vegetation.length).toBeGreaterThan(0)
    expect(a.chunks.length).toBe(16)
    expect(a.photorealismClaim).toBe(false)
  })

  it('streams chunks by viewer and unloads the far set', () => {
    const first = streamChunks(32, 8, [4, 4], 8)
    const second = streamChunks(32, 8, [28, 28], 8, first.resident)
    expect(first.resident.length).toBeGreaterThan(0)
    expect(second.unloaded.length).toBeGreaterThan(0)
    expect(second.resident.some(id => first.resident.includes(id))).toBe(false)
  })

  it('keeps slopes finite', () => {
    expect(generateTerrain('ridge', 16).verification.slopeFinite).toBe(true)
  })
})
