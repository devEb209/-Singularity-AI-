import { describe, expect, it } from 'vitest'
import { parsePlace, placeTag } from './event-place.js'
import { runLive } from './live-run.js'
import { composeWithStructures } from './structure.js'

describe('RRW live tick', () => {
  it('tags and parses a place on a reality node', () => {
    const human = composeWithStructures('oceano salgado com um humano e um abrigo').nodes.find(item => item.id === 'human')!
    const tag = placeTag(human)
    expect(tag.startsWith('at=')).toBe(true)
    expect(parsePlace(`forage ${tag}`)).toBeDefined()
  })

  it('runs one coupled world without closing Genesis', () => {
    const result = runLive('oceano salgado com fogo, floresta, um humano e um abrigo', 6)
    expect(result.fireCooled).toBe(true)
    expect(result.conservedWater).toBe(true)
    expect(result.conservedRock).toBe(true)
    expect(result.chronicleGrew).toBe(true)
    expect(result.settled).toBe(true)
    expect(result.sameIds).toBe(true)
    expect(result.shelterSurvived).toBe(true)
    expect(result.presented.sameIds).toBe(true)
    expect(result.walked.found).toBe(true)
    expect(result.walked.recast).toBe(false)
    expect(result.society.workSeen).toBe(true)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
  })
})
