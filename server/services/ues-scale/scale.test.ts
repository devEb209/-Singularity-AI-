import { describe, expect, it } from 'vitest'
import { UesScaleCore } from './core.js'
import { pathBetween, stack } from './ladder.js'
import { transition } from './transition.js'

describe('UES planetary continuity ladder', () => {
  it('walks space to object without a perceived ECEF jump', () => {
    expect(pathBetween('space', 'object')).toEqual(['space', 'planet', 'continent', 'region', 'city', 'street', 'object'])
    const city = stack('city')
    expect(city.find(item => item.rung === 'city')?.fidelity).toBe('full')
    expect(city.find(item => item.rung === 'space')?.fidelity).toBe('dormant')
    const hop = transition('continent', 'street', 'world-a', 10, 20)
    expect(hop.sameWorld).toBe(true)
    expect(hop.perceivedJump).toBe(false)
    const result = new UesScaleCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.loadedWholePlanet).toBe(false)
  })
})
