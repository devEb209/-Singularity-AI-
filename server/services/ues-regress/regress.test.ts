import { describe, expect, it } from 'vitest'
import { UesRegressCore } from './core.js'
import { compare, ssimLite } from './metrics.js'
import { scene } from './raster.js'

describe('UES CPU image regression', () => {
  it('scores identity high, accepts a small shift and rejects a corrupt raster', () => {
    const base = scene('base')
    expect(ssimLite(base, base)).toBeGreaterThan(0.99)
    expect(compare(base, scene('shift')).accept).toBe(true)
    expect(compare(base, scene('corrupt')).accept).toBe(false)
    const result = new UesRegressCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.gpu).toBe(false)
    expect(result.rollback).toBe(true)
  })
})
