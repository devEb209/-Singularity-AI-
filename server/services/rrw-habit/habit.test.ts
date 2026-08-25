import { describe, expect, it } from 'vitest'
import { RrwHabitCore } from './core.js'

describe('RRW habit service core', () => {
  it('inhabits a held world without claiming Genesis finished', () => {
    const result = new RrwHabitCore().process('oceano salgado com fogo, floresta, um humano e um abrigo')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.studio.shelterSurvived).toBe(true)
    expect(result.inhabited.city.sameIds).toBe(true)
  })
})
