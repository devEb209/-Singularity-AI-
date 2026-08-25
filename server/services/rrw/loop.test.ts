import { describe, expect, it } from 'vitest'
import { composeReality } from './compose.js'
import { exchangeWater, waterMoles } from './exchange.js'
import { parseIntent } from './intent.js'
import { runLoop } from './loop.js'
import { fixtureCoastMap, interpretMap } from './map-knowledge.js'
import { presentWorld } from './present.js'
import { scaleLiving } from './scale-living.js'
import { seedReality } from './world.js'
import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { phaseAt } from './matter.js'
import { requireSubstance } from './substances.js'

describe('RRW genesis close loop', () => {
  it('composes different biomes from intent instead of always returning the same shore', () => {
    expect(parseIntent('deserto quente com dunas').biome).toBe('desert')
    expect(parseIntent('floresta tropical úmida').biome).toBe('forest')
    expect(parseIntent('montanha com neve').biome).toBe('alpine')
    const coast = composeReality('oceano salgado na praia')
    const desert = composeReality('deserto quente com dunas')
    const alpine = composeReality('montanha fria com neve')
    expect(desert.oceanWater).toBeLessThan(coast.oceanWater)
    expect(alpine.oceanWater).toBeLessThan(coast.oceanWater)
    const alpineOcean = alpine.nodes.find(item => item.id === 'ocean')!
    expect(phaseAt(requireSubstance('H2O'), alpineOcean.temperatureK)).toBe('solid')
    expect(desert.heightfieldIsIdentity).toBe(false)
  })

  it('conserves water moles when rain equals evaporation and when both are zero', () => {
    const seeded = seedReality().nodes
    const dry = exchangeWater(seeded, 0, 0)
    expect(dry.conserved).toBe(true)
    const wet = exchangeWater(seeded, 0.4, 0.4)
    expect(wet.conserved).toBe(true)
    expect(waterMoles(wet.nodes)).toBeCloseTo(waterMoles(seeded), 9)
  })

  it('treats a height/moisture map as knowledge, not a pasted heightfield', () => {
    const knowledge = interpretMap(fixtureCoastMap())
    expect(knowledge.wetland).toBeGreaterThan(5)
    expect(knowledge.ridge).toBeGreaterThan(3)
    expect(knowledge.pastedHeightmap).toBe(false)
    expect(knowledge.heightfieldIsIdentity).toBe(false)
  })

  it('scales living nodes without a conceptual 320/1e6 cap and keeps the same IDs', () => {
    const scaled = scaleLiving(120)
    expect(scaled.requested).toBe(120)
    expect(scaled.sameIds).toBe(true)
    expect(scaled.conceptualCap).toBe(false)
    expect(scaled.uniqueFullMinds).toBe(false)
    expect(scaled.consciousnessClaim).toBe(true)
  })

  it('presents description packets instead of a framebuffer foundation', () => {
    const reality = seedReality()
    const presented = presentWorld(reality.nodes, adaptWorld(reality.nodes, situationsNearShore(reality.nodes), deviceProfiles.mobile).adaptations)
    expect(presented.framebufferFoundation).toBe(false)
    expect(presented.meshIsFoundation).toBe(false)
    expect(presented.packets.length).toBe(reality.nodes.length)
  })

  it('runs the close loop without claiming Genesis is finished', () => {
    const result = runLoop('oceano salgado com floresta e um humano', 3)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.completeReality).toBe(false)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.knowledge.puterFired).toBe(false)
    expect(result.knowledge.nasa).toBe(false)
    expect(result.devices.sameIds).toBe(true)
    expect(result.history.eraseHistory).toBe(false)
    expect(result.ports.fnws.identity).toBe(false)
    expect(result.map.pastedHeightmap).toBe(false)
  })
})
