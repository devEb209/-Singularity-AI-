import { describe, expect, it } from 'vitest'
import { runBio } from './bio-run.js'
import { compareCarrying } from './carrying.js'
import { compareSleep } from './sleep-rest.js'
import { compareTrophic } from './trophic.js'

describe('RRW biosphere', () => {
  it('moves carbon along a food web without RPG loot', () => {
    const trophic = compareTrophic()
    expect(trophic.conserved).toBe(true)
    expect(trophic.grazed).toBe(true)
    expect(trophic.rpgLoot).toBe(false)
  })

  it('supports more living mass in forest than desert without a 320 cap', () => {
    const carrying = compareCarrying()
    expect(carrying.forestSupportsMore).toBe(true)
    expect(carrying.noFixedCap).toBe(true)
  })

  it('rests at night without claiming consciousness', () => {
    const sleep = compareSleep()
    expect(sleep.nightRests).toBe(true)
    expect(sleep.dayDoesNot).toBe(true)
    expect(sleep.consciousnessClaim).toBe(false)
  })

  it('runs the biosphere graph without closing Genesis', () => {
    const result = runBio()
    expect(result.sameIds).toBe(true)
    expect(result.web.conserved).toBe(true)
    expect(result.reef.built).toBe(true)
    expect(result.albedo.snowBrighter).toBe(true)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.genesisClosed).toBe(false)
  })
})
