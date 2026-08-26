import { describe, expect, it } from 'vitest'
import { RrwVerifyCore } from './core.js'

describe('RRW verify service', () => {
  it('rejects inferred false boil and persists a reality graph, not a mesh store', () => {
    const result = new RrwVerifyCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.critic.rejected).toBe(1)
    expect(result.persist.meshStore).toBe(false)
    expect(result.verification.completeReality).toBe(false)
  })
})
