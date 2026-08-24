import { describe, expect, it } from 'vitest'
import { UesWorldCore } from '../ues-world/core.js'
import { avoid } from './avoidance.js'
import { UesNavCore } from './core.js'
import { astar } from './pathfind.js'

describe('UES navigation', () => {
  it('finds a path on a walkable grid', () => {
    const walkable = [
      [true, true, true],
      [true, false, true],
      [true, true, true],
    ]
    const cost = walkable.map(row => row.map(() => 1))
    const path = astar(walkable, cost, [0, 0], [2, 2])
    expect(path.found).toBe(true)
    expect(path.path[0]).toEqual([0, 0])
    expect(path.path.at(-1)).toEqual([2, 2])
  })

  it('routes an NMN flee action toward a map exit', () => {
    const world = new UesWorldCore().generate('nav-seed', 32, [8, 8])
    const nav = new UesNavCore()
    const compiled = nav.compile(world.terrain, world.roads, world.settlements)
    const from: [number, number] = [world.settlements[0].cx, world.settlements[0].cz]
    const start = compiled.grid.walkable[from[1]][from[0]] ? from : ([4, 4] as [number, number])
    const route = nav.route(compiled.grid, start, 'flee', world.settlements)
    expect(route.intent.action).toBe('flee')
    expect(route.intent.target[0] === 0 || route.intent.target[0] === 31).toBe(true)
  })

  it('steers agents away from a closing neighbor', () => {
    const next = avoid([
      { id: 'a', position: [0, 0], velocity: [1, 0], radius: 0.4, preferred: [1, 0] },
      { id: 'b', position: [0.6, 0], velocity: [-1, 0], radius: 0.4, preferred: [-1, 0] },
    ])
    expect(next[0].velocity[0] !== 1 || next[0].velocity[1] !== 0).toBe(true)
  })
})
