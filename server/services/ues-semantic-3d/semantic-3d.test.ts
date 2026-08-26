import { describe, expect, it } from 'vitest'
import { composeSemantic } from './compose.js'
import { UesSemantic3dCore } from './core.js'
import { classOf } from './lexicon.js'

describe('UES arbitrary semantic 3D', () => {
  it('builds valid graphs for classes outside the nine-kind catalog', () => {
    expect(classOf('ponte de pedra com dois arcos')).toBe('architecture')
    expect(classOf('drone quadricoptero')).toBe('vehicle')
    expect(classOf('lanterna de mao')).toBe('furniture')
    const unknown = composeSemantic('artefato hexagonal com antena e base')
    expect(unknown.identity.catalogBound).toBe(false)
    expect(unknown.verification.uniqueParts).toBe(true)
    expect(unknown.verification.allParentsExist).toBe(true)
    const bridge = new UesSemantic3dCore().process('ponte de pedra com dois arcos')
    expect(bridge.verification.valid).toBe(true)
    expect(bridge.verification.catalogBound).toBe(false)
    expect(bridge.verification.specialistDerived).toBe(false)
    expect(bridge.semantic.parts.length).toBeGreaterThan(3)
    const lamp = new UesSemantic3dCore().process('lanterna de mao com cabo e lente')
    expect(lamp.verification.valid).toBe(true)
  })
})
