import { describe, expect, it } from 'vitest'
import { UesGenesisCore } from './core.js'

describe('UES V1 Genesis close chain', () => {
  it('runs GPU API, shader IR, render graph, spatial, population and toolbox without fake vendors', () => {
    const result = new UesGenesisCore().process('genese: mundo, gpu e ecossistema')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.webgpuRequired).toBe(false)
    expect(result.verification.automaticPuter).toBe(false)
    expect(result.verification.googleRequired).toBe(false)
    expect(result.creation.instantAaa).toBe(false)
    expect(result.population.uniqueMillionMinds).toBe(false)
    expect(result.render.passes).toBe(9)
  })
})
