import { describe, expect, it } from 'vitest'
import { restrictedCard, sampleCards } from './cards.js'
import { UesReferenceCore } from './core.js'
import { extractConstraints } from './constraints.js'
import { rightsVerdict } from './rights.js'

describe('UES reference constraints', () => {
  it('extracts structured constraints and rejects unknown licenses', () => {
    const cards = sampleCards('humano')
    expect(extractConstraints(cards).length).toBeGreaterThanOrEqual(4)
    expect(rightsVerdict(cards).allowed).toBe(true)
    expect(rightsVerdict([...cards, restrictedCard()]).allowed).toBe(false)
    const result = new UesReferenceCore().process('humano')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.vision).toBe(false)
    expect(result.distanceToQuadruped).toBeGreaterThan(0)
  })
})
