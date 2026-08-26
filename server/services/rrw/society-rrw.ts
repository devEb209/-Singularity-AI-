import { identitiesPreserved, seedPopulation, tickSociety } from '../ues-lives/society.js'
import { climateFromClock } from './need-climate.js'
import { molesOf } from './extent.js'
import { feltTemperature } from './shelter-climate.js'
import type { RealityNode } from './types.js'
import type { ClimateState } from '../ues-lives/types.js'

export const climateFromReality = (nodes: RealityNode[], hour: number, dayOfYear: number): ClimateState => {
  const base = climateFromClock(hour, dayOfYear)
  const human = nodes.find(item => item.id === 'human')
  const cloud = nodes.find(item => item.id === 'cloud')
  const felt = human ? feltTemperature(human, nodes) : 288
  const heat = Math.max(0, Math.min(1, base.heat * 0.6 + Math.max(0, felt - 280) / 80))
  const rain = Math.max(base.rain, cloud ? Math.min(0.6, molesOf(cloud, 'H2O') / 40) : base.rain)
  return { ...base, heat, rain, label: `${base.label}:rrw` }
}

export const liveFromReality = (nodes: RealityNode[], prompt: string, hours = 24, count = 48) => {
  const { people: initial } = seedPopulation(`rrw-bind-${prompt.slice(0, 20)}`, count, Math.min(12, count))
  let people = initial.map(person => ({ ...person, needs: { ...person.needs } }))
  let workHours = 0
  const actions = new Set<string>()
  for (let hour = 0; hour < hours; hour++) {
    people = tickSociety(people, climateFromReality(nodes, hour % 24, 100), hour % 24)
    for (const person of people) {
      actions.add(person.lastAction)
      if (person.lastAction === 'work') workHours += 1
    }
  }
  return {
    population: people.length,
    identities: identitiesPreserved(initial, people),
    workSeen: workHours > 0,
    workHours,
    actions: [...actions],
    consciousnessClaim: false as const,
    uniqueFullMinds: false as const,
  }
}
