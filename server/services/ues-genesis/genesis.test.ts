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
    expect(result.raster.written).toBeGreaterThan(40)
    expect(result.raster.hardwareGpu).toBe(false)
    expect(result.knowledge.earthIsLimit).toBe(false)
    expect(result.scale.fixedCap).toBe(false)
    expect(result.image3d.learnedVision).toBe(false)
    expect(result.radiance.written).toBeGreaterThan(200)
    expect(result.radiance.beatsUnreal).toBe(false)
    expect(result.radiance.hardwareGpu).toBe(false)
    expect(result.rrw.traditionalPipeline).toBe(false)
    expect(result.rrw.meshIsFoundation).toBe(false)
    expect(result.rrw.sameIds).toBe(true)
    expect(result.rrw.completeReality).toBe(false)
    expect(result.rrw.nodes).toBeGreaterThan(8)
  })
})
