import { describe, expect, it } from 'vitest'
import { SnbCanonCore } from './core.js'
import { nothingErased, promote, seedUniverses } from './universe.js'

describe('SNB canon / lore versions', () => {
  it('promotes an alternate universe without erasing the previous main line', () => {
    const before = seedUniverses()
    const after = promote(before, 'mirror')
    expect(after.find(item => item.id === 'mirror')?.layer).toBe('main')
    expect(after.find(item => item.id === 'prime')?.layer).toBe('archived')
    expect(nothingErased(before, after)).toBe(true)
    const result = new SnbCanonCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.marketplaceLive).toBe(false)
  })
})
