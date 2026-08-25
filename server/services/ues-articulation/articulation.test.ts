import { describe, expect, it } from 'vitest'
import { iterateCcd } from './ccd.js'
import { defaultArm, forward, reach } from './chain.js'
import { UesArticulationCore } from './core.js'

describe('UES iterative articulation CCD', () => {
  it('reaches a nearby target, honors limits and does not explode on an unreachable one', () => {
    const arm = defaultArm()
    const start = forward(arm)
    expect(start.length).toBe(4)
    const hit = iterateCcd(arm, [0.42, 0.2])
    expect(hit.reached).toBe(true)
    expect(hit.limitsHonored).toBe(true)
    const miss = iterateCcd(arm, [8, 0], 20)
    expect(miss.reached).toBe(false)
    expect(miss.error).toBeGreaterThan(reach(arm) - 0.2)
    expect(miss.limitsHonored).toBe(true)
    const result = new UesArticulationCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.featherstone).toBe(false)
  })
})
