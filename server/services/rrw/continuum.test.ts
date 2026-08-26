import { describe, expect, it } from 'vitest'
import { catalogIsClosed, catalogSnapshot, listDomains } from './catalog.js'
import { molarMassBalance, reactions, stepChemistry } from './chemistry.js'
import { compareConductors } from './charge.js'
import { runContinuum } from './continuum.js'
import { stepEnergy } from './energy.js'
import { ingestStatement } from './ingest.js'
import { interpretDescription } from './interpret.js'
import { compareMagnet } from './magnetism.js'
import { elastic1d } from './mechanics.js'
import { compareAirWater } from './optics.js'
import { stepOrganisms } from './organism.js'
import { compareStarAndAir } from './plasma.js'
import { samePhenomenaAcrossDevices } from './select.js'
import { compareSoundMedia } from './waves.js'
import { seedReality } from './world.js'
import { requireSubstance } from './substances.js'

describe('RRW known-reality continuum', () => {
  it('keeps an open catalog and can ingest undescribed phenomena at law level', () => {
    expect(catalogIsClosed).toBe(false)
    expect(catalogSnapshot().open).toBe(true)
    expect(listDomains().length).toBeGreaterThan(20)
    const ingested = ingestStatement('um fenômeno ainda não catalogado explicitamente')
    expect(ingested.inferenceIsFact).toBe(false)
    expect(ingested.simulatedExplicitly).toBe(false)
    expect(ingested.node.claims[0].state).toBe('UNKNOWN')
  })

  it('interprets a description into knowledge and substances, not a heightmap asset', () => {
    const interpreted = interpretDescription('oceano salgado sob céu nublado com fogo, floresta e um humano')
    expect(interpreted.substances).toEqual(expect.arrayContaining(['H2O', 'NaCl', 'C', 'C6H10O5']))
    expect(interpreted.heightfieldIsIdentity).toBe(false)
    expect(interpreted.meshIsFoundation).toBe(false)
    expect(interpreted.nodes.some(item => item.inventory?.some(part => part.substanceId === 'NaCl'))).toBe(true)
  })

  it('runs chemistry with stoichiometric mass balance and combustion heat', () => {
    for (const reaction of reactions) {
      expect(molarMassBalance(reaction).relative).toBeLessThan(0.01)
    }
    const seeded = seedReality()
    const beforeC = seeded.nodes.find(item => item.id === 'fire')!.inventory!.find(item => item.substanceId === 'C')!.moles
    const chemistry = stepChemistry(seeded.nodes, 1)
    const afterC = chemistry.nodes.find(item => item.id === 'fire')!.inventory!.find(item => item.substanceId === 'C')?.moles ?? 0
    expect(afterC).toBeLessThan(beforeC)
    expect(chemistry.heatJ).toBeGreaterThan(0)
    expect(chemistry.particleSystem).toBe(false)
    expect(chemistry.events.some(item => item.reaction === 'combustion-c')).toBe(true)
  })

  it('exchanges heat with a tracked sink instead of exploding explicit forces', () => {
    const energy = stepEnergy(seedReality().nodes, 1)
    expect(energy.conservedWithSink).toBe(true)
    expect(energy.shaderHeat).toBe(false)
    const fire = energy.nodes.find(item => item.id === 'fire')!
    expect(fire.temperatureK).toBeLessThan(1100)
  })

  it('treats living nodes as organisms without consciousness claims', () => {
    const living = stepOrganisms(seedReality().nodes)
    const human = living.find(item => item.id === 'human')!
    const tree = living.find(item => item.id === 'tree')!
    expect(human.organism?.consciousnessClaim).toBe(false)
    expect(tree.organism?.action).toBe('photosynthesize')
    expect(human.organism?.needs.oxygen).toBeGreaterThan(0.7)
    expect(human.organism?.systems.some(item => item.id === 'metabolic')).toBe(true)
  })

  it('adapts the same phenomena across weak and strong devices', () => {
    const pair = samePhenomenaAcrossDevices()
    expect(pair.sameIds).toBe(true)
    expect(pair.differentDescription).toBe(true)
  })

  it('uses known mathematics for optics, waves, plasma, charge, magnetism and collisions', () => {
    expect(compareAirWater().bendsTowardNormal).toBe(true)
    expect(compareSoundMedia().waterFaster).toBe(true)
    expect(compareStarAndAir().starMoreIonized).toBe(true)
    expect(compareConductors().ironConductsMore).toBe(true)
    expect(compareMagnet(seedReality().nodes).strongerNear).toBe(true)
    expect(elastic1d(2, 1, 2, -1).conserved).toBe(true)
    expect(requireSubstance('C6H12O6').molarMass).toBeCloseTo(180.16, 2)
    expect('albedo' in requireSubstance('H2O')).toBe(false)
  })

  it('integrates the continuum without treating mesh/PBR as the foundation', () => {
    const result = runContinuum()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.traditionalPipeline).toBe(false)
    expect(result.catalog.open).toBe(true)
    expect(result.energy.conservedWithSink).toBe(true)
    expect(result.devices.sameIds).toBe(true)
    expect(result.persist.meshStore).toBe(false)
    expect(result.society.consciousnessClaim).toBe(false)
    expect(result.optics.bendsTowardNormal).toBe(true)
    expect(result.atmosphere.breathable).toBe(true)
    expect(result.soil.heightmapIsIdentity).toBe(false)
  })
})
