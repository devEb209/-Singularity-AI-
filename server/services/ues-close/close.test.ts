import { describe, expect, it } from 'vitest'
import { UesCloseCore } from './core.js'

describe('UES generation-1 close chain', () => {
  it('runs shared kernel, open 3D, gfx, motion and NMN without fake externals', () => {
    const result = new UesCloseCore().process('ponte de pedra e FN FAL recarregando')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.catalogBound).toBe(false)
    expect(result.verification.vulkanRequired).toBe(false)
    expect(result.verification.vision).toBe(false)
    expect(result.creation.instantAaa).toBe(false)
    expect(result.water.near).toBe(true)
    expect(result.water.far).toBe(false)
  })
})
