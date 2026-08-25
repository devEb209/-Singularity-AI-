import { hashSeed, rng, type Cell } from '../ues-shared/math.js'
import { chooseRepresentation } from '../ues-represent/choose.js'
import type { ClimateState, Household, Occupation, Resident } from './types.js'

const occupations: Occupation[] = ['farmer', 'medic', 'guard', 'merchant', 'child', 'clerk']

const outdoorOf = (occupation: Occupation) => occupation === 'farmer' || occupation === 'guard'

export const climateAt = (hour: number, heatwave = false): ClimateState => {
  const day = hour >= 6 && hour < 20
  const heat = heatwave ? (day ? 0.86 : 0.55) : day ? 0.42 : 0.18
  return { heat, rain: day ? 0.1 : 0.25, danger: heatwave ? 0.35 : 0.08, label: heatwave ? 'heatwave' : 'seasonal' }
}

export const seedPopulation = (seed: string, count = 1024, fullNear = 64): { households: Household[]; people: Resident[] } => {
  const random = rng(hashSeed(seed))
  const households: Household[] = []
  const people: Resident[] = []
  let remaining = count
  let householdIndex = 0
  while (remaining > 0) {
    const size = Math.min(remaining, 2 + Math.floor(random() * 4))
    const home: Cell = [Math.floor(random() * 48), Math.floor(random() * 48)]
    const id = `hh-${householdIndex}`
    const members: string[] = []
    for (let i = 0; i < size; i++) {
      const personId = `res-${people.length}`
      const occupation = occupations[Math.floor(random() * occupations.length)]
      const work: Cell = occupation === 'child' ? home : [Math.floor(random() * 48), Math.floor(random() * 48)]
      const near = people.length < fullNear
      const mid = people.length < fullNear + 192
      const choice = chooseRepresentation({
        domain: 'npc',
        influence: near ? 0.9 : mid ? 0.35 : 0.08,
        distance: near ? 1 : mid ? 8 : 30,
        visible: near || mid,
        interactive: near,
        reconstructable: true,
      })
      members.push(personId)
      people.push({
        id: personId,
        householdId: id,
        occupation,
        outdoor: outdoorOf(occupation),
        cell: home,
        home,
        work,
        fidelity: choice.kind === 'full' ? 'full' : choice.kind === 'simplified' || choice.kind === 'instanced' ? 'medium' : 'dormant',
        needs: { food: 0.7 + random() * 0.25, rest: 0.55 + random() * 0.3, social: 0.4 + random() * 0.4 },
        lastAction: 'sleep',
        hour: 0,
      })
    }
    households.push({ id, home, members })
    remaining -= size
    householdIndex += 1
  }
  return { households, people }
}

export const decideAction = (person: Resident, climate: ClimateState, hour: number) => {
  if (person.fidelity === 'dormant') return 'persist-only'
  if (climate.heat > 0.75 && person.outdoor) return 'seek-shade'
  if (person.needs.food < 0.22) return 'seek-food'
  if (person.needs.rest < 0.22 || hour < 6) return 'sleep'
  if (hour >= 8 && hour < 17 && person.occupation !== 'child') return 'work'
  if (person.needs.social < 0.28) return 'seek-company'
  return 'home'
}

const applyNeeds = (person: Resident, climate: ClimateState, hour: number, action: string): Resident['needs'] => {
  const dormant = person.fidelity === 'dormant'
  const food = Math.max(0, Math.min(1, person.needs.food - (dormant ? 0.008 : 0.02) - climate.heat * 0.01 + (action === 'seek-food' || action === 'home' ? 0.18 : 0)))
  const rest = Math.max(0, Math.min(1, person.needs.rest - (hour < 6 ? -0.1 : 0.025) - (climate.heat > 0.7 ? 0.03 : 0) + (action === 'sleep' ? 0.16 : 0)))
  const social = Math.max(0, Math.min(1, person.needs.social - 0.015 + (action === 'seek-company' || action === 'work' ? 0.12 : 0)))
  return { food, rest, social }
}

export const tickSociety = (people: Resident[], climate: ClimateState, hour: number) => {
  const nextHour = (hour + 1) % 24
  return people.map(person => {
    const action = decideAction(person, climate, nextHour)
    const needs = applyNeeds(person, climate, nextHour, action)
    const cell = action === 'work' ? person.work : action === 'sleep' || action === 'persist-only' || action === 'home' ? person.home : person.cell
    return { ...person, needs, lastAction: action, hour: nextHour, cell }
  })
}

export const identitiesPreserved = (before: Resident[], after: Resident[]) =>
  before.length === after.length && before.every((person, index) => person.id === after[index].id && person.householdId === after[index].householdId)
