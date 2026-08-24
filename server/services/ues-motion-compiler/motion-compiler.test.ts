import { describe, expect, it } from 'vitest'
import { UesMotionCompilerCore } from './core.js'
import { compileMotionPrompt } from './recipes.js'

describe('UES universal motion compiler', () => {
  it('builds a continuous reload clip from mechanics without requiring capture or vision', () => {
    expect(compileMotionPrompt('FN FAL recarregando').id).toBe('compile-reload')
    expect(compileMotionPrompt('personagem andando').id).toBe('compile-walk')
    const result = new UesMotionCompilerCore().process('FN FAL recarregando')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.vision).toBe(false)
    expect(result.verification.userCaptureRequired).toBe(false)
    expect(result.continuity).toBe(true)
  })
})
