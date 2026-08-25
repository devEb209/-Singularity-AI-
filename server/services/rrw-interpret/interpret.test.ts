import { describe, expect, it } from 'vitest'
import { RrwInterpretCore } from './core.js'

describe('RRW interpret service', () => {
  it('turns a description into substances without claiming learned vision', () => {
    const result = new RrwInterpretCore().process('oceano salgado e fogo na praia')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.learnedVision).toBe(false)
    expect(result.interpreted.substances).toEqual(expect.arrayContaining(['H2O', 'NaCl', 'C']))
  })
})
