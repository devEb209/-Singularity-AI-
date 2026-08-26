import { describe, expect, it } from 'vitest'
import { compareDrought } from './drought.js'
import { compareGroundwater } from './groundwater.js'
import { compareOzone } from './ozone.js'
import { runSphere } from './sphere-run.js'

describe('RRW spheres', () => {
  it('stores groundwater and conserves water', () => {
    const ground = compareGroundwater()
    expect(ground.conserved).toBe(true)
    expect(ground.stored).toBe(true)
  })

  it('keeps desert soil drier after drought', () => {
    const drought = compareDrought()
    expect(drought.conserved).toBe(true)
    expect(drought.desertDrierSoil).toBe(true)
  })

  it('attenuates UV without a NIST ozone inventory', () => {
    const ozone = compareOzone()
    expect(ozone.protects).toBe(true)
    expect(ozone.nistAssay).toBe(false)
  })

  it('runs hydro/cryo/geo/atmo without closing Genesis', () => {
    const result = runSphere()
    expect(result.sameIds).toBe(true)
    expect(result.hydro.flooded).toBe(true)
    expect(result.cryo.alpineIced).toBe(true)
    expect(result.geo.erupted).toBe(true)
    expect(result.atmo.ozone).toBe(true)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.genesisClosed).toBe(false)
  })
})
