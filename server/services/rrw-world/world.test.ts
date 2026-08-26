import { describe, expect, it } from 'vitest'
import { RrwWorldCore } from './core.js'

describe('RRW world service', () => {
  it('holds, walks and inhabits a composed reality without closing Genesis', () => {
    const result = new RrwWorldCore().process('floresta com chuva e humanos')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.held.stable).toBe(true)
    expect(result.walk.found).toBe(true)
    expect(result.society.consciousnessClaim).toBe(true)
    expect(result.image.learnedVision).toBe(false)
  })
})
