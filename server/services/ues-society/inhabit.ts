import { decide } from '../nmn/behavior.js'
import { warCast, warEvent } from '../nmn/core.js'
import { applyFidelity, fidelityForRelevance } from '../nmn/fidelity.js'
import type { NmnAction, NmnCharacter, NmnFidelity } from '../nmn/types.js'
import { destinationFor } from '../ues-nav/intent.js'
import { astar } from '../ues-nav/pathfind.js'
import type { NavGrid } from '../ues-nav/types.js'
import { rng } from '../ues-shared/math.js'
import type { Settlement } from '../ues-world/types.js'
import { seedStocks, tickStocks, type Stock } from './economy.js'

export interface Inhabitant {
  id: string
  cell: [number, number]
  occupation: string
  fidelity: NmnFidelity
  inventory: Record<'food' | 'water' | 'timber' | 'medicine' | 'tools', number>
  lastAction?: NmnAction | 'persist-only'
}

export const seedInhabitants = (projectId: string, settlements: Settlement[], count = 24) => {
  const random = rng(projectId.length * 91 + 3)
  const buildings = settlements.flatMap(item => item.buildings)
  const minds = warCast(projectId)
  const people: Inhabitant[] = Array.from({ length: count }, (_, index) => {
    const building = buildings[index % Math.max(1, buildings.length)]
    const relevance = index < 7 ? 0.95 : index < 14 ? 0.5 : 0.12
    return {
      id: `inh-${index}`,
      cell: building ? [building.x, building.z] as [number, number] : [4, 4],
      occupation: building?.kind ?? 'wanderer',
      fidelity: fidelityForRelevance(relevance),
      inventory: { food: 1 + random(), water: 1 + random(), timber: random(), medicine: random() * 0.3, tools: random() * 0.4 },
    }
  })
  minds.forEach((mind, index) => applyFidelity(mind, index < 7 ? 0.95 : 0.4))
  return { people, minds, stocks: seedStocks() }
}

export const inhabitTick = (people: Inhabitant[], minds: NmnCharacter[], grid: NavGrid, settlements: Settlement[], stocks: Stock[]) => {
  const nextStocks = tickStocks(stocks)
  const nextPeople = people.map((person, index) => {
    if (person.fidelity === 'dormant') return { ...person, lastAction: 'persist-only' as const }
    const mind = minds[index]
    let action: NmnAction = 'continue-routine'
    if (mind && (person.fidelity === 'full' || person.fidelity === 'high')) {
      action = decide(mind, warEvent(`${person.cell[0]}:${person.cell[1]}`)).action
    } else if (person.inventory.food < 0.4) action = 'seek-info'
    const intent = destinationFor(action, person.cell, settlements, grid.size)
    const path = astar(grid.walkable, grid.cost, person.cell, intent.target)
    return { ...person, cell: path.found && path.path[1] ? path.path[1] : person.cell, lastAction: action }
  })
  return { people: nextPeople, minds, stocks: nextStocks }
}
