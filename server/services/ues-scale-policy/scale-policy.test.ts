import { describe, expect, it } from 'vitest'
import { UesScalePolicyCore } from './core.js'
import { planScale } from './policy.js'

describe('UES D-O15 scale policy', () => {
  it('does not treat a count as a conceptual cap and overflows to dormant', () => {
    const planned = planScale(Array.from({ length: 12 }, (_, index) => ({
      id: `${index}`,
      domain: 'npc',
      influence: 0.95,
      distance: 1,
      visible: true,
      interactive: true,
    })), { full: 2, reduced: 3 })
    expect(planned.filter(item => item.kind === 'full')).toHaveLength(2)
    expect(planned.filter(item => item.kind === 'dormant').length).toBeGreaterThan(0)
    const result = new UesScalePolicyCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.fixedCap).toBe(false)
  })
})
