import { astar } from '../ues-nav/pathfind.js'
import type { NavGrid } from '../ues-nav/types.js'
import { hypot2 } from '../ues-shared/math.js'
import type { Citizen } from './types.js'
import type { District } from './types.js'

export const destinationAtHour = (citizen: Citizen, hour: number) => {
  if (hour >= 7 && hour < 17) return citizen.work
  return citizen.home
}

export const actionAtHour = (hour: number): Citizen['lastAction'] => {
  if (hour < 7) return 'sleep'
  if (hour < 9) return 'commute'
  if (hour < 17) return 'work'
  if (hour < 19) return 'commute'
  return 'home'
}

export const tickLives = (people: Citizen[], grid: NavGrid, districts: District[], viewer: [number, number], hour: number) => {
  const nextHour = (hour + 1) % 24
  return people.map(person => {
    if (person.fidelity === 'dormant') return { ...person, hour: nextHour, lastAction: 'persist-only' as const }
    const homeDistrict = districts.find(item => item.id === person.districtId)
    const far = homeDistrict ? hypot2([homeDistrict.cx, homeDistrict.cz], viewer) > grid.size * 0.45 : false
    if (far || person.fidelity === 'low' || person.fidelity === 'medium') {
      const target = destinationAtHour(person, nextHour)
      return { ...person, hour: nextHour, cell: target, lastAction: far ? 'aggregate' : actionAtHour(nextHour) }
    }
    const target = destinationAtHour(person, nextHour)
    const path = astar(grid.walkable, grid.cost, person.cell, target)
    return {
      ...person,
      hour: nextHour,
      cell: path.found && path.path[1] ? path.path[1] : person.cell,
      lastAction: actionAtHour(nextHour),
    }
  })
}
