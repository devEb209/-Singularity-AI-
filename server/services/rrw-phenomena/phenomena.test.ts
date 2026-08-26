import { describe, expect, it } from 'vitest'
import { RrwPhenomenaCore } from './core.js'

describe('RRW phenomena service', () => {
  it('executes the integrated continuum and refuses completeness claims', () => {
    const result = new RrwPhenomenaCore().process('oceano salgado com fogo e floresta')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.openCatalog).toBe(true)
    expect(result.quantities.conserved).toBe(true)
    expect(result.phenomena.sameIds).toBe(true)
  })
})
