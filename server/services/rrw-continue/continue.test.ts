import { describe, expect, it } from 'vitest'
import { RrwContinueCore } from './core.js'

describe('RRW continue service core', () => {
  it('continues a held world without claiming Genesis finished', () => {
    const result = new RrwContinueCore().process('2 dias de oceano salgado com fogo, floresta, um humano e um abrigo')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.continued.shelterSurvived).toBe(true)
    expect(result.presented.sameIds).toBe(true)
  })
})
