import { describe, expect, it } from 'vitest'
import { islands, sweptAabb } from './ccd.js'

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
