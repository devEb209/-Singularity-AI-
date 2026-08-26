import { describe, expect, it } from 'vitest'
import { applyCardToModel } from '../ues-umotion/explorer.js'
import { reloadFal } from '../ues-umotion/cards.js'
import { UesExplorerCore } from './core.js'

describe('UES Explorer Manager apply', () => {
  it('applies overlapping joints and reports missing ones without claiming vision', () => {
    const result = applyCardToModel(reloadFal, ['l-upper-arm', 'r-upper-arm', 'head'])
    expect(result.applied).toEqual(expect.arrayContaining(['l-upper-arm', 'r-upper-arm']))
    expect(result.missing).toContain('spine')
    expect(result.vision).toBe(false)
    const explorer = new UesExplorerCore().process()
    expect(explorer.verification.valid).toBe(true)
    expect(explorer.verification.vision).toBe(false)
  })
})
