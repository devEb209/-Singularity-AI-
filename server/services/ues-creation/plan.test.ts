import { describe, expect, it } from 'vitest'
import { creationPlan } from './plan.js'

describe('UES creation plan', () => {
  it('refuses instant AAA and requires time', () => {
    const plan = creationPlan('jogo de mundo aberto', 12)
    expect(plan.instantAaa).toBe(false)
    expect(plan.needsTime).toBe(true)
    expect(plan.verification.valid).toBe(true)
  })
})
