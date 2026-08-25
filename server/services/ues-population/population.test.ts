import { describe, expect, it } from 'vitest'
import { UesPopulationCore } from './core.js'
import { compactCells, planPopulation } from './scale.js'

describe('UES hierarchical population', () => {
  it('represents one million as compact statistics without unique minds', () => {
    const bands = planPopulation(1_000_000, 64)
    expect(bands.reduce((sum, item) => sum + item.agents, 0)).toBe(1_000_000)
    expect(bands.find(item => item.cognition === 'statistical')?.uniqueMinds).toBe(false)
    const cells = compactCells(100, 8)
    expect(cells.reduce((sum, item) => sum + item.count, 0)).toBe(100)
    const result = new UesPopulationCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.uniqueMillionMinds).toBe(false)
  })
})
