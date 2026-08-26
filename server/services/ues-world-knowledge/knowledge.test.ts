import { describe, expect, it } from 'vitest'
import { UesWorldKnowledgeCore } from './core.js'
import { earthLaws, interpretCell } from './interpret.js'

describe('UES world structural knowledge', () => {
  it('reads fields as knowledge and can switch laws for a non-Earth world', () => {
    expect(interpretCell({ elevation: 0.05, moisture: 0.8, temperature: 0.7, latitude: 0.05 }, earthLaws).biome).toBe('rainforest')
    expect(interpretCell({ elevation: 0.2, moisture: 0.1, temperature: 0.7, latitude: 0.2 }).biome).toBe('desert')
    const earth = new UesWorldKnowledgeCore().process('earth')
    const alien = new UesWorldKnowledgeCore().process('alien')
    expect(earth.verification.valid).toBe(true)
    expect(earth.verification.earthIsLimit).toBe(false)
    expect(alien.world.laws).toBe('custom')
    expect(alien.world.biomes).not.toEqual(earth.earth.biomes)
  })
})
