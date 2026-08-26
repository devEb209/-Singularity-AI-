import { describe, expect, it } from 'vitest'
import { runSense } from './sense-run.js'
import { compareSmell } from './smell.js'
import { compareTaste } from './taste.js'
import { compareTouch } from './touch.js'

describe('RRW senses', () => {
  it('detects scent without a smell shader', () => {
    const smell = compareSmell()
    expect(smell.detected).toBe(true)
    expect(smell.shaderSmell).toBe(false)
  })

  it('tastes salt in the ocean and glucose in the human', () => {
    const taste = compareTaste()
    expect(taste.oceanSalty).toBe(true)
    expect(taste.humanTasted).toBe(true)
  })

  it('touches the tool without a rigidbody asset', () => {
    const touch = compareTouch()
    expect(touch.grasped).toBe(true)
    expect(touch.rigidbodyAsset).toBe(false)
  })

  it('runs senses and studio claims without closing Genesis', () => {
    const result = runSense()
    expect(result.sameIds).toBe(true)
    expect(result.smell.detected).toBe(true)
    expect(result.pain.signal).toBe(true)
    expect(result.pain.consciousnessClaim).toBe(false)
    expect(result.studio.kept).toBe(true)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.genesisClosed).toBe(false)
  })
})
