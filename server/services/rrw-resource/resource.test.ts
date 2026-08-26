import { describe, expect, it } from 'vitest'
import { classifyDevice, demandsDedicatedGpu, snapshot } from './budget.js'
import { RrwResourceCore } from './core.js'

describe('RRW resource manager', () => {
  it('classifies devices and never demands a dedicated GPU', () => {
    expect(classifyDevice({ cores: 1, memoryMB: 1024, presentGpu: false })).toBe('ancient')
    expect(classifyDevice({ cores: 4, memoryMB: 3072, presentGpu: false })).toBe('mobile')
    expect(classifyDevice({ cores: 16, memoryMB: 32768, presentGpu: true, dedicated: true })).toBe('dedicated')
    expect(demandsDedicatedGpu()).toBe(false)
    expect(snapshot({ cores: 4, memoryMB: 3072, presentGpu: false }).device.continuumSlots).toBeGreaterThan(0)
    const result = new RrwResourceCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.dedicatedGpuRequired).toBe(false)
  })
})
