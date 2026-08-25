import { describe, expect, it } from 'vitest'
import { UesGfxCore } from './core.js'
import { encodeFrame } from './encode.js'

describe('UES owned graphics API', () => {
  it('encodes a command stream that culls low-influence nodes without requiring Vulkan', () => {
    const frame = encodeFrame([
      { id: 'near', domain: 'geometry', influence: 0.9, distance: 1, instances: 1, material: 'a' },
      { id: 'far', domain: 'world', influence: 0.05, distance: 40, instances: 1, material: 'b' },
    ], 'cpu-json')
    expect(frame.drawn).toBe(1)
    expect(frame.culled).toBe(1)
    expect(frame.ownsLowLevelApi).toBe(false)
    const result = new UesGfxCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.vulkanRequired).toBe(false)
  })
})
