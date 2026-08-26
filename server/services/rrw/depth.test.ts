import { describe, expect, it } from 'vitest'
import { compareAging } from './aging.js'
import { compareCarbon } from './carbon-cycle.js'
import { compareCulture } from './culture-claim.js'
import { runDepth } from './depth-run.js'
import { compareNitrogen } from './nitrogen-cycle.js'
import { compareReproduction } from './reproduction.js'
import { compareTimeScale } from './time-scale.js'

describe('RRW depth continuum', () => {
  it('conserves carbon and nitrogen atoms', () => {
    expect(compareCarbon().conserved).toBe(true)
    expect(compareNitrogen().conserved).toBe(true)
    expect(compareNitrogen().nistAssay).toBe(false)
  })

  it('spawns one sapling without claiming minds', () => {
    const repro = compareReproduction()
    expect(repro.spawned).toBe(true)
    expect(repro.once).toBe(true)
    expect(repro.consciousnessClaim).toBe(false)
  })

  it('ages living systems without diagnosing', () => {
    const aged = compareAging()
    expect(aged.olderWeaker).toBe(true)
    expect(aged.medicalDiagnosis).toBe(false)
  })

  it('shares culture as knowledge and treats time as description not LOD', () => {
    expect(compareCulture().shared).toBe(true)
    expect(compareTimeScale().notLod).toBe(true)
    expect(compareTimeScale().lodPreset).toBe(false)
  })

  it('runs the living depth graph without closing Genesis', () => {
    const result = runDepth()
    expect(result.sameIds).toBe(true)
    expect(result.sapling).toBe(true)
    expect(result.cycles.carbon).toBe(true)
    expect(result.cycles.nitrogen).toBe(true)
    expect(result.living.grew).toBe(true)
    expect(result.knowledge.remembered).toBe(true)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.genesisClosed).toBe(false)
  })
})
