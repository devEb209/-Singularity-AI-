import { sunElevation } from './circadian.js'
import { insolationFactor, seasonOf, type RealityClock } from './orbit.js'

export const solarFlux = (clock: RealityClock, latitudeDeg = 32) =>
  sunElevation(clock.hour) * insolationFactor(latitudeDeg, clock.dayOfYear)

export const compareInsolation = () => {
  const noonSummer = solarFlux({ hour: 12, dayOfYear: 200, moon: 0 })
  const nightSummer = solarFlux({ hour: 2, dayOfYear: 200, moon: 0 })
  const noonWinter = solarFlux({ hour: 12, dayOfYear: 15, moon: 0 })
  return {
    noonSummer,
    nightSummer,
    noonWinter,
    dayBrighter: noonSummer > nightSummer,
    summerStronger: noonSummer > noonWinter,
    winterSeason: seasonOf(15),
    summerSeason: seasonOf(200),
    shaderSun: false as const,
    skybox: false as const,
  }
}
