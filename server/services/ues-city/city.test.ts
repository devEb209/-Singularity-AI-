import { describe, expect, it } from 'vitest'
import { UesCityCore } from './core.js'
import { actionAtHour, destinationAtHour } from './lives.js'
import type { Citizen } from './types.js'

describe('UES city census', () => {
  it('builds at least five districts and a 96-agent sample that actually moves', () => {
    const result = new UesCityCore().simulate('harbor-delta', 8)
    expect(result.sampleSize).toBe(96)
    expect(result.districts.length).toBeGreaterThanOrEqual(5)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.millions).toBe(false)
    expect(result.occupancy.some(item => item.moved > 0)).toBe(true)
    expect(new Set(result.districts.map(item => item.kind)).size).toBeGreaterThanOrEqual(3)
  })

  it('sends citizens to work in the day and home at night', () => {
    const citizen = { home: [2, 2], work: [8, 8] } as Citizen
    expect(destinationAtHour(citizen, 10)).toEqual([8, 8])
    expect(destinationAtHour(citizen, 21)).toEqual([2, 2])
    expect(actionAtHour(8)).toBe('commute')
    expect(actionAtHour(11)).toBe('work')
  })
})
