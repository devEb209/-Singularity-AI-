import { describe, expect, it } from 'vitest'
import { RrwStudioCore } from './core.js'
import { inspectReality } from './inspect.js'

describe('RRW studio inspects reality nodes', () => {
  it('does not use a mesh viewport as the foundation', () => {
    const view = inspectReality('mobile')
    expect(view.meshViewport).toBe(false)
    expect(view.experience.framebufferFoundation).toBe(false)
    expect(view.nodes.some(item => item.id === 'ocean')).toBe(true)
    const result = new RrwStudioCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.aaaEditor).toBe(false)
  })
})
