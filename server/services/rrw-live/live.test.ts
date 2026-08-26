import { describe, expect, it } from 'vitest'
import { RrwLiveCore } from './core.js'

describe('RRW live service core', () => {
  it('couples one world tick without claiming Genesis finished', () => {
    const result = new RrwLiveCore().process('oceano salgado com fogo, floresta, um humano e um abrigo')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.fireCooled).toBe(true)
    expect(result.walked.found).toBe(true)
  })
})
