import { climateAt, identitiesPreserved, seedPopulation, tickSociety } from '../ues-lives/society.js'
import { composeReality } from './compose.js'

export const liveSocietyDays = (prompt = 'oceano salgado com humanos', hours = 36, count = 48) => {
  composeReality(prompt)
  const { people: initial } = seedPopulation(`rrw-days-${prompt.slice(0, 24)}`, count, Math.min(12, count))
  let people = initial.map(person => ({ ...person, needs: { ...person.needs } }))
  const actions = new Set<string>()
  let workHours = 0
  for (let hour = 0; hour < hours; hour++) {
    people = tickSociety(people, climateAt(hour % 24, false), hour % 24)
    for (const person of people) {
      actions.add(person.lastAction)
      if (person.lastAction === 'work') workHours += 1
    }
  }
  return {
    hours,
    population: people.length,
    identities: identitiesPreserved(initial, people),
    workSeen: workHours > 0,
    workHours,
    actions: [...actions],
    consciousnessClaim: false as const,
    uniqueFullMinds: false as const,
    scriptedNpc: false as const,
  }
}
