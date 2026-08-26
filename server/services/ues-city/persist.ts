import type { Citizen, District } from './types.js'

export const snapshotLives = (people: Citizen[]): Citizen[] =>
  people.map(person => ({
    ...person,
    home: [person.home[0], person.home[1]],
    work: [person.work[0], person.work[1]],
    cell: [person.cell[0], person.cell[1]],
  }))

export const transplant = (people: Citizen[], districts: District[]): Citizen[] =>
  people.map((person, index) => {
    const dest = districts[index % Math.max(1, districts.length)]
    const home: [number, number] = [dest.cx, dest.cz]
    return {
      ...person,
      districtId: dest.id,
      home,
      cell: person.fidelity === 'dormant' ? home : person.cell,
      lastAction: 'persist-only',
    }
  })

export const identitiesPreserved = (before: Citizen[], after: Citizen[]) =>
  before.length === after.length && before.every((person, index) => person.id === after[index].id && person.occupation === after[index].occupation)
