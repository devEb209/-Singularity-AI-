import { describe, expect, it } from 'vitest'
import { compareEm } from './electromagnetic.js'
import { materializeOcean } from './hydro.js'
import { runDay } from './run.js'
import { freezeReality, thawReality } from './snapshot.js'
import { seedReality } from './world.js'

describe('RRW day tick', () => {
  it('interacts, conserves water volume, freezes state and does not treat FNWS as the ocean identity', () => {
    const day = runDay()
    expect(day.grasp).toBe(true)
    expect(day.hydro.conserved).toBe(true)
    expect(day.hydro.fnwsIsIdentity).toBe(false)
    expect(day.hydro.shaderWater).toBe(false)
    expect(day.snapshot.restored).toBe(true)
    expect(day.experience.framebufferFoundation).toBe(false)
    expect(compareEm().waterBlocksMicrowaveMoreThanAir).toBe(true)
    const seeded = seedReality()
    const frozen = freezeReality(seeded.nodes, seeded.relations)
    expect(thawReality(frozen).nodes.length).toBe(seeded.nodes.length)
    expect(materializeOcean().formula).toBe('H2O')
  })
})
