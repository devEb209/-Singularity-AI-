import { describe, expect, it } from 'vitest'
import { chooseRepresentation } from './choose.js'
import { UesRepresentCore } from './core.js'

describe('UES D-O15 representation', () => {
  it('dorms reconstructable far systems and keeps near interactive ones full', () => {
    const far = chooseRepresentation({ domain: 'world', influence: 0.04, distance: 40, visible: false, interactive: false, reconstructable: true })
    const near = chooseRepresentation({ domain: 'geometry', influence: 0.9, distance: 1, visible: true, interactive: true, reconstructable: true })
    expect(far.kind).toBe('dormant')
    expect(far.render).toBe(false)
    expect(far.simulate).toBe(false)
    expect(near.kind).toBe('full')
    expect(near.render).toBe(true)
    const result = new UesRepresentCore().process('balanced')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.objectOnly).toBe(false)
    expect(result.summary.drawn).toBeLessThan(result.choices.length)
  })
})
