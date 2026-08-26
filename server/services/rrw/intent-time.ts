import { seasonOf, type RealityClock, type SeasonKind } from './orbit.js'

const has = (hay: string, keys: string[]) => keys.some(key => hay.includes(key))

const daysFrom = (hay: string) => {
  const match = hay.match(/(\d+)\s*(dias?|days?)/)
  if (match) return Math.max(1, Math.min(14, Number(match[1])))
  if (has(hay, ['semana', 'week'])) return 7
  if (has(hay, ['mês', 'mes', 'month'])) return 14
  return 2
}

const hourFrom = (hay: string) => {
  if (has(hay, ['noite', 'night', 'madrugada'])) return 2
  if (has(hay, ['amanhecer', 'dawn', 'alvorecer'])) return 6
  if (has(hay, ['entardecer', 'dusk', 'pôr do sol', 'por do sol'])) return 18
  if (has(hay, ['tarde', 'afternoon'])) return 16
  if (has(hay, ['meio-dia', 'meio dia', 'noon', 'meio-dia'])) return 12
  return 12
}

const dayOfYearFrom = (hay: string) => {
  if (has(hay, ['inverno', 'winter', 'neve', 'gelo'])) return 15
  if (has(hay, ['verão', 'verao', 'summer'])) return 200
  if (has(hay, ['outono', 'autumn', 'fall'])) return 280
  if (has(hay, ['primavera', 'spring'])) return 100
  return 100
}

export const parseTimeIntent = (prompt: string) => {
  const hay = prompt.toLowerCase()
  const days = daysFrom(hay)
  const hour = hourFrom(hay)
  const dayOfYear = dayOfYearFrom(hay)
  const season: SeasonKind = seasonOf(dayOfYear)
  const clock: RealityClock = { hour, dayOfYear, moon: 0.25 }
  return {
    prompt,
    days,
    hour,
    dayOfYear,
    season,
    clock,
    wantsNight: hour < 6 || hour >= 18,
    wantsWinter: season === 'winter',
    instantAaa: false as const,
    realismRequired: false as const,
  }
}
