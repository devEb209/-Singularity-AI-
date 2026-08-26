import { describe, expect, it } from 'vitest'
import { compareHydrology, cycleWater } from './hydrology.js'
import { composeReality } from './compose.js'
import { compareDevices } from './device-matrix.js'
import { recordSessionLine } from './memory-line.js'
import { observeSpan } from './observe-span.js'
import { compareReconstruct } from './reconstruct.js'
import { holdAndResume, openSession, tickSession } from './session.js'
import { compareSoil } from './soil-cycle.js'
import { liveSocietyDays } from './society-days.js'

describe('RRW session, hydrology, devices and society days', () => {
  it('conserves water and cellulose while transferring them', () => {
    const hydro = cycleWater(composeReality('oceano salgado').nodes)
    expect(hydro.conserved).toBe(true)
    expect(hydro.shaderWater).toBe(false)
    expect(compareHydrology().wetlandWetterSoil).toBe(true)
    expect(compareSoil().conserved).toBe(true)
    expect(compareSoil().textureVegetation).toBe(false)
  })

  it('resumes a held session without recomposing the world', () => {
    const opened = openSession('oceano salgado com fogo')
    const ticked = tickSession(opened, 4)
    const resumed = holdAndResume('oceano salgado com fogo')
    expect(ticked.lineage).toHaveLength(2)
    expect(ticked.checksum).not.toBe(opened.checksum)
    expect(resumed.resumed).toBe(true)
    expect(resumed.recomposed).toBe(false)
    expect(resumed.sameIds).toBe(true)
    expect(resumed.thawed).toBe(true)
    expect(recordSessionLine().evolved).toBe(true)
    expect(recordSessionLine().eraseHistory).toBe(false)
  })

  it('presents the same reality on weak and strong devices and reconstructs dormant nodes', () => {
    const devices = compareDevices()
    expect(devices.sameIds).toBe(true)
    expect(devices.weakerDescribesLess).toBe(true)
    expect(devices.hardwareDeterminesArchitecture).toBe(false)
    const reconstructed = compareReconstruct()
    expect(reconstructed.dormant).toBeGreaterThan(0)
    expect(reconstructed.sameIds).toBe(true)
    expect(reconstructed.meshFromStub).toBe(false)
    expect(observeSpan().nightDimmer).toBe(true)
    expect(observeSpan().framebufferFoundation).toBe(false)
  })

  it('keeps society identities and records work across a whole day span', () => {
    const society = liveSocietyDays('oceano salgado com humanos', 36, 48)
    expect(society.identities).toBe(true)
    expect(society.workSeen).toBe(true)
    expect(society.consciousnessClaim).toBe(false)
    expect(society.uniqueFullMinds).toBe(false)
  })
})
