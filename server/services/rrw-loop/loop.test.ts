import { describe, expect, it } from 'vitest'
import { RrwLoopCore } from './core.js'

describe('RRW loop service', () => {
  it('executes the close loop and refuses to mark Genesis closed', () => {
    const result = new RrwLoopCore().process('deserto com um humano e ferro')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.intent.biome).toBe('desert')
    expect(result.composed.oceanWater).toBeLessThan(200)
  })
})
