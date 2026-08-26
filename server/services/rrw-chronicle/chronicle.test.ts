import { describe, expect, it } from 'vitest'
import { RrwChronicleCore } from './core.js'

describe('RRW chronicle service core', () => {
  it('records a held chronicle without claiming Genesis finished', () => {
    const result = new RrwChronicleCore().process('oceano salgado com fogo, floresta, um humano e um abrigo')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.session.fireRemembered).toBe(true)
    expect(result.reactions.hungryForages).toBe(true)
  })
})
