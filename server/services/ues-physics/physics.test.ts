import { describe, expect, it } from 'vitest'
import { islands, sweptAabb } from './ccd.js'
import { boxHull, sphere } from './convex.js'
import { UesPhysicsCore } from './core.js'
import { contact } from './epa.js'
import { gjk } from './gjk.js'
import { rotationalAdvance } from './rotate.js'
import { sleepIslands } from './sleep.js'

describe('UES CCD and islands', () => {
  it('detects a falling body hitting the ground and groups islands', () => {
    const hit = sweptAabb(
      { id: 'box', position: [0, 2, 0], velocity: [0, -30, 0], half: [0.4, 0.4, 0.4] },
      { id: 'ground', position: [0, 0, 0], velocity: [0, 0, 0], half: [4, 0.2, 4] },
      0.2,
    )
    expect(hit).toBeTruthy()
    expect(hit!.toi).toBeGreaterThanOrEqual(0)
    expect(hit!.toi).toBeLessThanOrEqual(0.2)
    const groups = islands([hit!, { a: 'box', b: 'wall', toi: 0.1, normal: [1, 0, 0] }])
    expect(groups.some(group => group.includes('box') && group.includes('ground') && group.includes('wall'))).toBe(true)
  })
})

describe('UES GJK/EPA and sleep', () => {
  it('separates distant spheres and measures overlap of intersecting spheres', () => {
    expect(gjk(sphere('a', [0, 0, 0], 1), sphere('b', [4, 0, 0], 1)).hit).toBe(false)
    const hit = contact(sphere('a', [0, 0, 0], 1), sphere('b', [1.5, 0, 0], 1))
    expect(hit.hit).toBe(true)
    expect(hit.epa).toBeTruthy()
    expect(hit.epa!.depth).toBeGreaterThan(0.35)
    expect(hit.epa!.depth).toBeLessThan(0.65)
    expect(Math.abs(hit.epa!.normal[0])).toBeGreaterThan(0.85)
  })

  it('detects overlapping boxes, sleeps still islands and finds a rotating sweep hit', () => {
    const boxes = contact(boxHull('a', [0, 0, 0], [0.5, 0.5, 0.5]), boxHull('b', [0.8, 0, 0], [0.5, 0.5, 0.5]))
    expect(boxes.hit).toBe(true)
    expect(boxes.epa?.depth).toBeGreaterThan(0.1)
    const bodies = [
      { id: 'a', velocity: [0.01, 0, 0] as [number, number, number], sleeping: false, still: 0 },
      { id: 'b', velocity: [0, 0.01, 0] as [number, number, number], sleeping: false, still: 0 },
      { id: 'c', velocity: [3, 0, 0] as [number, number, number], sleeping: false, still: 0 },
    ]
    for (let i = 0; i < 4; i++) sleepIslands(bodies, [['a', 'b'], ['c']])
    expect(bodies[0].sleeping).toBe(true)
    expect(bodies[1].sleeping).toBe(true)
    expect(bodies[2].sleeping).toBe(false)
    const sweep = rotationalAdvance([0, 0, 0], [0.4, 0.4, 0.8], 0, Math.PI / 2, boxHull('wall', [1, 0, 0], [0.3, 0.3, 0.3]))
    expect(sweep.hit).toBe(true)
    expect(sweep.toi).toBeGreaterThan(0)
    expect(sweep.toi).toBeLessThan(1)
    expect(new UesPhysicsCore().process().verification.valid).toBe(true)
  })
})
