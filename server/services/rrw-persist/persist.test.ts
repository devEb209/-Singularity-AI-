import { describe, expect, it } from 'vitest'
import { WorldStore } from '../rrw/world-store.js'
import { RrwPersistCore } from './core.js'

describe('RRW persist service core', () => {
  it('persists a world without claiming Genesis finished', () => {
    const result = new RrwPersistCore().process('oceano salgado com fogo, floresta, um humano e um abrigo', new WorldStore())
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.dThesis.absolutePerfectionClaim).toBe(false)
    expect(result.fireCooled).toBe(true)
    expect(result.reloaded).toBe(true)
    expect(result.share.webrtc).toBe(false)
  })
})
