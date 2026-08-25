import { describe, expect, it } from 'vitest'
import { compareMedia } from './coupling.js'
import { RrwCore } from './core.js'
import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { contains, exportCompatibilityMesh } from './geometry.js'
import { phaseAt } from './matter.js'
import { requireSubstance } from './substances.js'
import { seedReality } from './world.js'

describe('RRW reality foundation', () => {
  it('represents matter and light without a traditional mesh/PBR/RT pipeline', () => {
    const water = requireSubstance('H2O')
    const gold = requireSubstance('Au')
    expect(water.molarMass).toBeCloseTo(18.015, 3)
    expect(phaseAt(water, 250)).toBe('solid')
    expect(phaseAt(water, 290)).toBe('liquid')
    expect(phaseAt(water, 400)).toBe('gas')
    expect('roughness' in water).toBe(false)
    expect('metalness' in water).toBe(false)
    expect('albedo' in water).toBe(false)
    const media = compareMedia()
    expect(media.water.luminance).toBeLessThan(media.air.luminance)
    expect(media.gold.spectrum.blue / 0.85).toBeLessThan(media.gold.spectrum.red / 0.8)
    expect(media.water.rayTraced).toBe(false)
    expect(media.water.pbr).toBe(false)
    const ocean = seedReality().nodes.find(item => item.id === 'ocean')!
    expect(contains(ocean.extent, [0, 0, 0])).toBe(true)
    expect(contains(ocean.extent, [0, 9, 0])).toBe(false)
    expect(exportCompatibilityMesh(ocean.extent).foundation).toBe(false)
  })

  it('adapts the same reality across weak and strong devices without Low/Medium/High presets', () => {
    const reality = seedReality()
    const situations = situationsNearShore(reality.nodes)
    const phone = adaptWorld(reality.nodes, situations, deviceProfiles.mobile)
    const desk = adaptWorld(reality.nodes, situations, deviceProfiles.dedicated)
    expect(phone.adaptations.map(item => item.nodeId).sort()).toEqual(desk.adaptations.map(item => item.nodeId).sort())
    expect(phone.lod).toBe(false)
    expect(phone.ultraPreset).toBe(false)
    expect(phone.hardwareDeterminesArchitecture).toBe(false)
    expect(phone.adaptations.some(item => item.description !== desk.adaptations.find(entry => entry.nodeId === item.nodeId)?.description)).toBe(true)
    expect(reality.nodes.filter(item => item.kind === 'living').every(item => item.living?.consciousnessClaim === false)).toBe(true)
    const result = new RrwCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.traditionalPipeline).toBe(false)
    expect(result.verification.meshIsFoundation).toBe(false)
    expect(result.verification.pbrIsFoundation).toBe(false)
    expect(result.verification.lodIsDo15).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.webgpuRequired).toBe(false)
    expect(result.devices.sameIds).toBe(true)
    expect(result.materialization.compatibilityFoundation).toBe(false)
    expect(result.evolve.fireAfter).toBeLessThan(result.evolve.fireBefore)
    expect(result.gravity.near).toBeLessThan(result.gravity.far)
    expect(result.grove.sameIds).toBe(true)
    expect(result.grove.nodes).toBeGreaterThan(50)
    expect(result.experience.framebufferFoundation).toBe(false)
    expect(result.knowledge.inferenceIsFact).toBe(false)
    expect(result.day.grasp).toBe(true)
    expect(result.day.hydroConserved).toBe(true)
    expect(result.day.guestConsciousness).toBe(true)
    expect(result.day.emMicrowave).toBe(true)
    expect(result.continuum.catalogOpen).toBe(true)
    expect(result.continuum.conservedWithSink).toBe(true)
    expect(result.continuum.samePhenomena).toBe(true)
  })
})
