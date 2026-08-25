import { describe, expect, it } from 'vitest'
import { RrwPresentCore } from './core.js'

describe('RRW present service', () => {
  it('materializes description packets without a framebuffer foundation', () => {
    const result = new RrwPresentCore().process('floresta com chuva')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.framebufferFoundation).toBe(false)
    expect(result.phone.packets).toBe(result.dedicated.packets)
  })
})
