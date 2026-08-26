import { describe, expect, it } from 'vitest'
import { compareInsolation } from './insolation.js'
import { compareSeasons } from './season.js'
import { compareTides } from './tide.js'
import { compareWeather } from './weather.js'
import { seasonOf } from './orbit.js'

describe('RRW season, weather, tide and insolation', () => {
  it('warms summer ocean without a skybox and keeps alpine winter solid', () => {
    const seasons = compareSeasons('oceano salgado com fogo')
    expect(seasons.summerWarmer).toBe(true)
    expect(seasons.shaderSeason).toBe(false)
    expect(seasons.skybox).toBe(false)
    expect(seasons.alpineStaysCold).toBe(true)
    expect(seasons.alpineWinterPhase).toBe('solid')
    expect(seasonOf(15)).toBe('winter')
    expect(seasonOf(200)).toBe('summer')
  })

  it('moves cloud by pressure wind and raises high tide without shaders', () => {
    expect(compareWeather().cloudMoved).toBe(true)
    expect(compareWeather().shaderWeather).toBe(false)
    expect(compareTides().highHigher).toBe(true)
    expect(compareTides().shaderTide).toBe(false)
    expect(compareInsolation().dayBrighter).toBe(true)
    expect(compareInsolation().summerStronger).toBe(true)
    expect(compareInsolation().shaderSun).toBe(false)
  })
})
