import { climateAt, identitiesPreserved, seedPopulation, tickSociety } from '../ues-lives/society.js'
import { sunElevation } from './circadian.js'
import { composeReality } from './compose.js'
import { seasonOf } from './orbit.js'

export const climateFromClock = (hour: number, dayOfYear = 100, heatwave = false) => {
  const elevation = sunElevation(hour)
  const season = seasonOf(dayOfYear)
  const seasonal = season === 'summer' ? 0.28 : season === 'winter' ? 0.04 : 0.14
  const heat = Math.max(0, Math.min(1, seasonal + elevation * (season === 'summer' ? 0.5 : 0.28) + (heatwave ? 0.35 : 0)))
  return {
    heat,
    rain: season === 'winter' ? 0.32 : 0.12,
    danger: heatwave ? 0.4 : 0.08,
    label: heatwave ? 'heatwave' : season,
  }
}

export const liveWithClimate = (prompt = 'oceano salgado com humanos', hours = 24, count = 48) => {
  composeReality(prompt)
  const { people: initial } = seedPopulation(`rrw-climate-${prompt.slice(0, 20)}`, count, Math.min(12, count))
  let people = initial.map(person => ({ ...person, needs: { ...person.needs } }))
  const actions = new Set<string>()
  let workHours = 0
  for (let hour = 0; hour < hours; hour++) {
    const climate = climateFromClock(hour % 24, 200)
    people = tickSociety(people, climate, hour % 24)
    for (const person of people) {
      actions.add(person.lastAction)
      if (person.lastAction === 'work') workHours += 1
    }
  }
  const summer = climateFromClock(12, 200)
  const winter = climateFromClock(12, 15)
  return {
    hours,
    population: people.length,
    identities: identitiesPreserved(initial, people),
    workSeen: workHours > 0,
    workHours,
    actions: [...actions],
    summerHotter: summer.heat > winter.heat,
    fallbackClimate: climateAt(12, false).label,
    consciousnessClaim: false as const,
    uniqueFullMinds: false as const,
  }
}
