import { describe, expect, it } from 'vitest'
import { UesSynthesisCore } from './core.js'

describe('UES world synthesis', () => {
  it('raises ocean share when sea level increases', () => {
    const result = new UesSynthesisCore().synthesize({
      kind: 'alternate',
      seed: 'earth-like',
      mutations: [{ field: 'seaLevel', delta: 0.2 }],
    })
    expect(result.mutated.ocean).toBeGreaterThanOrEqual(result.base.ocean)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.magic).toBe(false)
  })
})
