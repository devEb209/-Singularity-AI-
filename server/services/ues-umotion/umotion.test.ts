import { describe, expect, it } from 'vitest'
import { bake, sampleCard } from './apply.js'
import { reloadFal } from './cards.js'
import { UesUmotionCore } from './core.js'

describe('UES universal motion cards', () => {
  it('bakes a continuous reload clip without claiming vision', () => {
    const mid = sampleCard(reloadFal, 0.5)
    expect(mid['l-upper-arm']).toBeGreaterThan(0.5)
    expect(bake(reloadFal).continuity).toBe(true)
    const result = new UesUmotionCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.vision).toBe(false)
    expect(result.verification.videoSearch).toBe('adapter-required')
  })
})
