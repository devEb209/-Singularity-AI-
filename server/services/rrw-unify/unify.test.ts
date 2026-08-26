import { describe, expect, it } from 'vitest'
import { RrwUnifyCore } from './core.js'

describe('RRW unify service core', () => {
  it('unifies one persisted world without claiming Genesis finished', () => {
    const result = new RrwUnifyCore().process('oceano salgado com fogo, floresta, um humano e um abrigo')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.kin.bound).toBe(true)
    expect(result.speech.tts).toBe(false)
    expect(result.scatter.rayTraced).toBe(false)
  })
})
