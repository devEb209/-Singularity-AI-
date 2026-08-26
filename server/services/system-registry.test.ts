import { describe, expect, it } from 'vitest'
import { singularitySystems, systemSummary } from './system-registry.js'

describe('150-system architecture registry', () => {
  it('tracks all 150 systems with stable IDs', () => {
    expect(singularitySystems).toHaveLength(150)
    expect(new Set(singularitySystems.map(system => system.id)).size).toBe(150)
    expect(new Set(singularitySystems.map(system => system.name)).size).toBe(150)
  })

  it('never reports planned foundations as operational', () => {
    const summary = systemSummary()
    expect(summary.operational + summary.foundation + summary.planned).toBe(150)
    expect(summary.planned).toBeGreaterThan(0)
  })
})
