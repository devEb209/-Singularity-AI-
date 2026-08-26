import { describe, expect, it } from 'vitest'
import { compareAcidity } from './acidity.js'
import { compareDew } from './dew-fog.js'
import { runEarth } from './earth-run.js'
import { compareLightning } from './lightning-step.js'
import { compareMagnetosphere } from './magnetosphere.js'
import { compareSalinity } from './salinity.js'

describe('RRW earth continuum', () => {
  it('keeps the ocean saltier than the river and conserves salt', () => {
    const salt = compareSalinity()
    expect(salt.conserved).toBe(true)
    expect(salt.oceanSaltier).toBe(true)
  })

  it('dissolves CO2 without a pH meter', () => {
    const acid = compareAcidity()
    expect(acid.conserved).toBe(true)
    expect(acid.moreAcid).toBe(true)
    expect(acid.phMeter).toBe(false)
  })

  it('has a stronger field near the planet than far away', () => {
    expect(compareMagnetosphere().strongerNear).toBe(true)
    expect(compareMagnetosphere().nasaField).toBe(false)
  })

  it('condenses dew and conserves lightning charge', () => {
    expect(compareDew().dew).toBe(true)
    expect(compareDew().conserved).toBe(true)
    expect(compareLightning().struck).toBe(true)
    expect(compareLightning().conserved).toBe(true)
  })

  it('runs earth processes without closing Genesis', () => {
    const result = runEarth()
    expect(result.sameIds).toBe(true)
    expect(result.earth.eroded).toBe(true)
    expect(result.transport.lifted).toBe(true)
    expect(result.craft.built).toBe(true)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.genesisClosed).toBe(false)
  })
})
