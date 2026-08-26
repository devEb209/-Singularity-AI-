import { describe, expect, it } from 'vitest'
import { UesKernelCore } from './core.js'
import { kernelStages } from './types.js'

describe('UES shared kernel', () => {
  it('runs the eight-stage chain and still rejects a D-O15 proposal below the quality floor', () => {
    expect(kernelStages).toHaveLength(8)
    const result = new UesKernelCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.do15.rejected.length).toBeGreaterThan(0)
    expect(result.thesis.absolutePerfectionClaim).toBe(false)
  })
})
