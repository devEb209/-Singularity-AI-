export type SeasonKind = 'winter' | 'spring' | 'summer' | 'autumn'

export interface RealityClock {
  hour: number
  dayOfYear: number
  moon: number
}

export const wrapDay = (day: number) => ((day % 365) + 365) % 365

export const wrapHour = (hour: number) => ((hour % 24) + 24) % 24

export const wrapMoon = (moon: number) => ((moon % 1) + 1) % 1

export const declinationDeg = (dayOfYear: number) =>
  23.44 * Math.sin((2 * Math.PI * (wrapDay(dayOfYear) - 80)) / 365)

export const seasonOf = (dayOfYear: number): SeasonKind => {
  const day = wrapDay(dayOfYear)
  if (day < 80 || day >= 355) return 'winter'
  if (day < 172) return 'spring'
  if (day < 266) return 'summer'
  return 'autumn'
}

export const insolationFactor = (latitudeDeg: number, dayOfYear: number) => {
  const declination = declinationDeg(dayOfYear) * (Math.PI / 180)
  const latitude = latitudeDeg * (Math.PI / 180)
  return Math.max(0, Math.sin(latitude) * Math.sin(declination) + Math.cos(latitude) * Math.cos(declination))
}

export const latitudeOf = (id: string) => {
  if (id === 'cloud' || id === 'storm') return 28
  if (id === 'tree' || id === 'soil' || id === 'terrain') return 24
  if (id === 'ocean' || id === 'river') return 32
  if (id === 'atmosphere') return 30
  return 22
}

export const advanceClock = (clock: RealityClock, hours = 1): RealityClock => {
  const total = clock.hour + hours
  const dayDelta = Math.floor(total / 24)
  return {
    hour: wrapHour(total),
    dayOfYear: wrapDay(clock.dayOfYear + dayDelta),
    moon: wrapMoon(clock.moon + hours / (29.53 * 24)),
  }
}

export const referenceClock = (hour = 12, dayOfYear = 100, moon = 0.25): RealityClock => ({
  hour: wrapHour(hour),
  dayOfYear: wrapDay(dayOfYear),
  moon: wrapMoon(moon),
})
