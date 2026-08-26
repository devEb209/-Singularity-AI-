import { describe, expect, it } from 'vitest'
import { runCivic } from './civic-run.js'
import { compareGift } from './gift.js'
import { compareHumidity } from './humidity.js'
import { compareNorms } from './norms.js'

describe('RRW civic and extremes', () => {
  it('keeps a grove reserve while foraging', () => {
    const norms = compareNorms()
    expect(norms.reserved).toBe(true)
    expect(norms.took).toBe(true)
  })

  it('gifts glucose and conserves carbon', () => {
    const gift = compareGift()
    expect(gift.conserved).toBe(true)
    expect(gift.given).toBe(true)
    expect(gift.marketplace).toBe(false)
  })

  it('keeps forest air wetter than desert', () => {
    const humidity = compareHumidity()
    expect(humidity.forestWetter).toBe(true)
  })

  it('runs civic plus extremes without closing Genesis', () => {
    const result = runCivic()
    expect(result.sameIds).toBe(true)
    expect(result.civic.given).toBe(true)
    expect(result.extreme.risen).toBe(true)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.genesisClosed).toBe(false)
  })
})
