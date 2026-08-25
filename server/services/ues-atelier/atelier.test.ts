import { describe, expect, it } from 'vitest'
import { UesAtelierCore } from './core.js'

describe('UES generation-1 atelier chain', () => {
  it('runs solid, Featherstone, studio, mesh-nav, lives and consensus without fake externals', () => {
    const result = new UesAtelierCore().process('ponte de pedra habitada e bloco recortado')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.imageTo3d).toBe(false)
    expect(result.verification.physx).toBe(false)
    expect(result.verification.recast).toBe(false)
    expect(result.verification.automaticPuter).toBe(false)
    expect(result.creation.instantAaa).toBe(false)
    expect(result.lives.population).toBe(1024)
    expect(result.consensus.decision).toBe('integrate')
  })
})
