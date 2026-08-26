import { describe, expect, it } from 'vitest'
import { runUnify } from './unify.js'

describe('RRW unify', () => {
  it('keeps one persisted world with living continuum without closing Genesis', () => {
    const result = runUnify('oceano salgado com fogo, floresta, um humano e um abrigo', 3)
    expect(result.persist.fireCooled).toBe(true)
    expect(result.persist.shelterSurvived).toBe(true)
    expect(result.kin.bound).toBe(true)
    expect(result.labor.conserved).toBe(true)
    expect(result.labor.worked).toBe(true)
    expect(result.trade.conserved).toBe(true)
    expect(result.trade.traded).toBe(true)
    expect(result.health.alpineCirculatoryLower).toBe(true)
    expect(result.speech.heard).toBe(true)
    expect(result.speech.tts).toBe(false)
    expect(result.scatter.cloudDimmer).toBe(true)
    expect(result.scatter.rayTraced).toBe(false)
    expect(result.rain.conserved).toBe(true)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.kin.consciousnessClaim).toBe(false)
  })
})
