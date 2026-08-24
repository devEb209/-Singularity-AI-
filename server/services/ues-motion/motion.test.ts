import { describe, expect, it } from 'vitest'
import { clipLibrary } from './clips.js'
import { blend, footLock, jointLimit, stride } from './locomotion.js'
import { match, queryFor, transition } from './match.js'

describe('UES locomotion', () => {
  it('locks the foot near the ground on the descending phase', () => {
    expect(footLock(0.13, 0.12, true).locked).toBe(true)
    expect(footLock(0.4, 0.12, true).locked).toBe(false)
    expect(footLock(0.13, 0.12, false).locked).toBe(false)
    const mixed = blend([0, 0], [10, 10], 0.5)
    expect(mixed[0]).toBeGreaterThan(4)
    expect(mixed[0]).toBeLessThan(6)
    expect(stride().verification.valid).toBe(true)
    expect(jointLimit(2, -0.5, 0.5)).toEqual({ angle: 0.5, limited: true })
  })
})

describe('UES motion matching', () => {
  it('matches a walk query to walk and forbids idle to run', () => {
    const library = clipLibrary()
    const walk = match(queryFor('walk'), library, 'walk')
    expect(walk.clip.kind).toBe('walk')
    expect(transition('idle', 'run').allowed).toBe(false)
    expect(transition('walk', 'run').allowed).toBe(true)
    const idle = match(queryFor('idle'), library, 'idle')
    expect(idle.clip.kind).toBe('idle')
  })
})
