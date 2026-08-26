import { describe, expect, it } from 'vitest'
import { blockedTag } from './catalog.js'
import { SnbToolboxCore } from './core.js'
import { chooseMain, nothingErased, seedLore } from './lore.js'

describe('SNB toolbox and living lore', () => {
  it('keeps archived universes and filters abusive tags', () => {
    const before = seedLore()
    const after = chooseMain(before, 'alt-c')
    expect(nothingErased(before, after)).toBe(true)
    expect(after.find(item => item.id === 'main-a')?.layer).toBe('archived')
    expect(blockedTag('hate')).toBe(true)
    expect(blockedTag('bridge')).toBe(false)
    const result = new SnbToolboxCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.marketplaceLive).toBe(false)
  })
})
