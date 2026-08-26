import { describe, expect, it } from 'vitest'
import { askChronicle, chronicleSize } from './ask-chronicle.js'
import { remember, statementsOf } from './chronicle.js'
import { chronicleSession } from './chronicle-session.js'
import { runChronicle } from './chronicle-run.js'
import { compareReactions } from './react-living.js'
import { composeWithStructures } from './structure.js'

describe('RRW chronicle', () => {
  it('remembers statements without erasing previous ones', () => {
    const first = remember(composeWithStructures('oceano salgado com um abrigo').nodes, 'shelter added')
    const second = remember(first.nodes, 'fire cooled 1100 -> 900')
    expect(chronicleSize(second.nodes)).toBe(2)
    expect(statementsOf(second.nodes).some(item => item.includes('shelter'))).toBe(true)
    expect(second.eraseHistory).toBe(false)
    expect(askChronicle(second.nodes, 'o que aconteceu com o fogo').found).toBe(true)
  })

  it('binds living actions to water, cold and hunger on the reality graph', () => {
    const reactions = compareReactions()
    expect(reactions.coldSeeksShelter).toBe(true)
    expect(reactions.drySeeksWater).toBe(true)
    expect(reactions.hungryForages).toBe(true)
    expect(reactions.consciousnessClaim).toBe(false)
  })

  it('keeps the chronicle after reloading the session envelope', () => {
    const session = chronicleSession()
    expect(session.fireCooled).toBe(true)
    expect(session.chronicleKept).toBe(true)
    expect(session.fireRemembered).toBe(true)
    expect(session.forageRemembered).toBe(true)
    expect(session.shelterSurvived).toBe(true)
    expect(session.sameIds).toBe(true)
    expect(session.society.workSeen).toBe(true)
    expect(session.eraseHistory).toBe(false)
  })

  it('runs the chronicle path without closing Genesis', () => {
    const result = runChronicle()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.meshLog).toBe(false)
  })
})
