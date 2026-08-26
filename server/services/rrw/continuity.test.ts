import { describe, expect, it } from 'vitest'
import { continueFromEnvelope } from './continue-session.js'
import { runContinuity } from './continuity.js'
import { inhabitDays } from './days-inhabit.js'
import { forageDays } from './food-days.js'
import { parseTimeIntent } from './intent-time.js'
import { presentInhabited } from './present-inhabit.js'
import { queryComposed } from './query-world.js'
import { refineHeld } from './refine-held.js'
import { compareShelterClimate } from './shelter-climate.js'
import { compareSoundscape } from './soundscape.js'

describe('RRW continuity', () => {
  it('parses days and night from the description', () => {
    const time = parseTimeIntent('3 dias de inverno à noite com um humano')
    expect(time.days).toBe(3)
    expect(time.wantsNight).toBe(true)
    expect(time.wantsWinter).toBe(true)
    expect(time.instantAaa).toBe(false)
  })

  it('keeps a body warmer inside the shelter than outside', () => {
    const climate = compareShelterClimate()
    expect(climate.inside).toBe(true)
    expect(climate.shelterWarmer).toBe(true)
    expect(climate.shaderIndoor).toBe(false)
  })

  it('forages across days without creating cellulose', () => {
    const food = forageDays('floresta com um humano e um abrigo', 3)
    expect(food.conserved).toBe(true)
    expect(food.humanGained).toBe(true)
  })

  it('hears water faster than air and keeps night audible without a shader', () => {
    const sound = compareSoundscape()
    expect(sound.waterFaster).toBe(true)
    expect(sound.nightAudible).toBe(true)
    expect(sound.shaderAudio).toBe(false)
  })

  it('answers where the shelter is and how much water exists', () => {
    const query = queryComposed()
    expect(query.foundShelter).toBe(true)
    expect(query.hasWater).toBe(true)
    expect(query.hasLiving).toBe(true)
    expect(query.meshQuery).toBe(false)
  })

  it('reloads a held envelope and keeps cooling fire with the shelter intact', () => {
    const continued = continueFromEnvelope()
    expect(continued.loaded).toBe(true)
    expect(continued.sameIds).toBe(true)
    expect(continued.resumed).toBe(true)
    expect(continued.shelterSurvived).toBe(true)
    expect(continued.recomposed).toBe(false)
  })

  it('presents the inhabited world on weak and strong devices', () => {
    const presented = presentInhabited()
    expect(presented.sameIds).toBe(true)
    expect(presented.weakerDescribesLess).toBe(true)
    expect(presented.framebufferFoundation).toBe(false)
  })

  it('runs days, refines a held ocean and does not close Genesis', () => {
    expect(inhabitDays().shelter).toBe(true)
    expect(refineHeld().settled).toBe(true)
    const result = runContinuity('2 dias de oceano salgado com fogo, floresta, um humano e um abrigo')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
  })
})
