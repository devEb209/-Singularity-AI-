import { describe, expect, it } from 'vitest'
import { probeAstro } from './adapter.js'
import { direction, localCatalog } from './catalog.js'
import { UesAstroCore } from './core.js'

describe('UES astronomical catalog', () => {
  it('keeps eight Keplerian planets and refuses a fake n-body universe', () => {
    const catalog = localCatalog(0)
    expect(catalog.planets).toHaveLength(8)
    expect(catalog.nBody).toBe(false)
    expect(catalog.completeSky).toBe(false)
    const unit = direction(0, 0)
    expect(Math.hypot(unit.x, unit.y, unit.z)).toBeCloseTo(1, 5)
    expect(probeAstro('simbad').status).toBe('ADAPTER_AVAILABLE')
    const result = new UesAstroCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.nasa).toBe(false)
    expect(result.motion.earthMoved).toBe(true)
  })
})
