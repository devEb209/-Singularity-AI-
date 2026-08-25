import { describe, expect, it } from 'vitest'
import { UesShaderCore } from './core.js'
import { defaultGraph } from './graph.js'
import { lowerGraph } from './ir.js'
import { cpuEval, optimizeIr } from './optimize.js'

describe('UES shader compiler', () => {
  it('folds 2*3, drops unused nodes and still evaluates on CPU', () => {
    const ir = lowerGraph(defaultGraph())
    const opt = optimizeIr(ir, 'surf')
    expect(opt.some(op => op.id === 'unused')).toBe(false)
    expect(opt.find(op => op.id === 'six')?.imm).toBe(6)
    expect(cpuEval(opt, 'surf', 0.5)).toBeCloseTo(0.5 * (1 - 0.1 * 0.4), 8)
    const result = new UesShaderCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.wgsl).toContain('6.')
  })
})
