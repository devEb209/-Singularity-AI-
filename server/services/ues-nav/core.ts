import { DThesisCore } from '../d-thesis/core.js'
import type { NmnAction } from '../nmn/types.js'
import type { RoadGraph, Settlement, Terrain } from '../ues-world/types.js'
import { avoid } from './avoidance.js'
import { buildNavGrid } from './grid.js'
import { destinationFor } from './intent.js'
import { astar } from './pathfind.js'
import type { AgentStep } from './types.js'
import type { Cell } from '../ues-shared/math.js'

export class UesNavCore {
  private thesis = new DThesisCore()

  compile(terrain: Terrain, roads: RoadGraph, settlements: Settlement[]) {
    const grid = buildNavGrid(terrain, roads, settlements)
    const dThesis = this.thesis.evaluate({
      objective: 'Compilar malha navegável e roteamento contextual NMN',
      constraints: ['sem onisciência', 'evitar colisão local'],
      resources: ['CPU'],
      priorities: { quality: 7, performance: 8, safety: 8, cost: 5, scalability: 8 },
    })
    return { format: 'ues-nav-v1', grid, dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp }, verification: { valid: grid.verification.walkableCells > 0 && !grid.verification.isolated } }
  }

  route(grid: ReturnType<typeof buildNavGrid>, from: Cell, action: NmnAction, settlements: Settlement[]) {
    const intent = destinationFor(action, from, settlements, grid.size)
    const goal = grid.walkable[intent.target[1]]?.[intent.target[0]] ? intent.target : from
    const path = astar(grid.walkable, grid.cost, from, goal)
    return { intent, path, verification: { valid: path.found || (from[0] === goal[0] && from[1] === goal[1]) } }
  }

  step(agents: AgentStep[]) {
    return avoid(agents)
  }
}
