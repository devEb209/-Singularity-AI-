import { describe, expect, it } from 'vitest'
import { blend, footLock, stride } from './locomotion.js'

describe('UES locomotion', () => {
  it('locks the foot near the ground on the descending phase', () => {
    expect(footLock(0.13, 0.12, true).locked).toBe(true)
    expect(footLock(0.4, 0.12, true).locked).toBe(false)
    expect(footLock(0.13, 0.12, false).locked).toBe(false)
    const mixed = blend([0, 0], [10, 10], 0.5)
    expect(mixed[0]).toBeGreaterThan(4)
    expect(mixed[0]).toBeLessThan(6)
    expect(stride().verification.valid).toBe(true)
  })
})
