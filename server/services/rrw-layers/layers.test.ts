import { describe, expect, it } from 'vitest'
import { realityLayers } from './catalog.js'
import { constructProgressive } from './construct.js'
import { coupleAdjacent } from './couple.js'
import { runLayers } from './construct-run.js'
import { inspectLayer } from './observe.js'
import { compareReplay } from './replay.js'
import { transversalCount } from './transversal.js'

describe('UES reality construction layers', () => {
  it('keeps all thirty layers and twenty transversal systems', () => {
    expect(realityLayers).toHaveLength(30)
    expect(realityLayers[0].id).toBe(0)
    expect(realityLayers[29].id).toBe(29)
    expect(realityLayers.every(item => item.do15MayDelete === false)).toBe(true)
    expect(transversalCount).toBe(20)
  })

  it('constructs every layer without D-O15 deleting one', () => {
    const built = constructProgressive()
    expect(built.layersPresent).toEqual([...Array(30).keys()])
    expect(built.do15DeletedLayer).toBe(false)
    expect(built.sameIds).toBe(true)
    expect(coupleAdjacent().bidirectional).toBe(true)
    expect(inspectLayer(built.entities, 18).count).toBeGreaterThan(0)
    expect(inspectLayer(built.entities, 29).count).toBeGreaterThan(0)
  })

  it('replays time without an AAA timeline', () => {
    const replay = compareReplay()
    expect(replay.pausedHolds).toBe(true)
    expect(replay.sped).toBe(true)
    expect(replay.rewinded).toBe(true)
    expect(replay.aaaTimeline).toBe(false)
  })

  it('runs the fabric without closing Genesis or claiming complete reality', () => {
    const result = runLayers()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.consciousnessReproduced).toBe(false)
    expect(result.verification.do15DeletedLayer).toBe(false)
    expect(result.presented.allPresent).toBe(true)
  })
})
