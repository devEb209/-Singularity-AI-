import { describe, expect, it } from 'vitest'
import { applyRefine } from './apply-refine.js'
import { evolveDays } from './days.js'
import { holdWorld } from './hold.js'
import { interpretImageKnowledge } from './image-knowledge.js'
import { bindSociety } from './society-world.js'
import { walkReality } from './walk.js'
import { seedReality } from './world.js'

describe('RRW held world', () => {
  it('evolves days, cools fire and keeps an alpine ocean solid', () => {
    const coast = evolveDays('oceano salgado com fogo', 2)
    expect(coast.fireCooled).toBe(true)
    expect(coast.steps).toBe(8)
    const alpine = evolveDays('montanha com neve', 1)
    expect(alpine.oceanPhase).toBe('solid')
  })

  it('applies critic refine by fixing phase mismatches', () => {
    const nodes = seedReality().nodes.map(node => (node.id === 'ocean' ? { ...node, phase: 'gas' as const } : node))
    const refined = applyRefine(nodes)
    expect(refined.phasesFixed).toBe(true)
    expect(refined.after).toBe(0)
    expect(refined.inferenceIsFact).toBe(false)
  })

  it('reads a luminance image as moisture/relief knowledge, not a pasted mesh', () => {
    const knowledge = interpretImageKnowledge()
    expect(knowledge.ridge).toBeGreaterThan(0)
    expect(knowledge.wetland).toBeGreaterThan(0)
    expect(knowledge.learnedVision).toBe(false)
    expect(knowledge.meshFromImage).toBe(false)
    expect(knowledge.heightfieldIsIdentity).toBe(false)
  })

  it('walks the reality extents without Recast and binds society without consciousness', () => {
    const walk = walkReality('oceano salgado com um humano')
    expect(walk.found).toBe(true)
    expect(walk.recast).toBe(false)
    const society = bindSociety('oceano salgado com humanos', 48)
    expect(society.identities).toBe(true)
    expect(society.sameIds).toBe(true)
    expect(society.consciousnessClaim).toBe(true)
    expect(society.uniqueFullMinds).toBe(false)
  })

  it('holds a composed world checksum and restores the same node count', () => {
    const held = holdWorld('deserto quente com dunas')
    expect(held.biome).toBe('desert')
    expect(held.restored).toBe(true)
    expect(held.stable).toBe(true)
    expect(held.meshStore).toBe(false)
    expect(held.evolved).toBe(true)
  })
})
