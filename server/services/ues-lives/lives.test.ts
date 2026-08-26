import { describe, expect, it } from 'vitest'
import { UesLivesCore } from './core.js'
import { climateAt, identitiesPreserved, seedPopulation, tickSociety } from './society.js'

describe('UES hierarchical persistent lives', () => {
  it('keeps 1024 identities, lods far agents and increases shade-seeking under heatwave', () => {
    const { people } = seedPopulation('lives-test', 1024, 64)
    expect(people).toHaveLength(1024)
    expect(people.filter(item => item.fidelity === 'full')).toHaveLength(64)
    expect(people.some(item => item.fidelity === 'dormant')).toBe(true)
    const day = tickSociety(people, climateAt(12, false), 12)
    const hot = tickSociety(people, climateAt(12, true), 12)
    expect(identitiesPreserved(people, day)).toBe(true)
    expect(hot.filter(item => item.lastAction === 'seek-shade').length).toBeGreaterThan(day.filter(item => item.lastAction === 'seek-shade').length)
    const result = new UesLivesCore().process('lives-test')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.millions).toBe(false)
    expect(result.verification.consciousnessClaim).toBe(false)
    expect(result.climate.heatwaveShade).toBeGreaterThan(result.climate.seasonalShade)
  })
})
