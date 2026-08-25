import { describe, expect, it } from 'vitest'
import { RrwChainCore } from './core.js'

describe('RRW chain service core', () => {
  it('runs the chain through the kernel without claiming Genesis finished', () => {
    const result = new RrwChainCore().process('oceano salgado com fogo e um humano')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.session.resumed).toBe(true)
    expect(result.devices.sameIds).toBe(true)
    expect(result.refine.settled).toBe(true)
  })
})
