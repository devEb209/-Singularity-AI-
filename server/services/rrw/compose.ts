import { cloneNodes, molesOf, setMoles } from './extent.js'
import { interpretDescription } from './interpret.js'
import { parseIntent, type BiomeKind } from './intent.js'
import { phaseAt } from './matter.js'
import { requireSubstance } from './substances.js'
import type { RealityNode, RealityRelation } from './types.js'
import { seedReality } from './world.js'

const setWater = (node: RealityNode, moles: number) => ({
  ...node,
  inventory: setMoles(node.inventory ?? [], 'H2O', moles),
})

const heat = (node: RealityNode, temperatureK: number) => {
  const substance = node.substanceId ? requireSubstance(node.substanceId) : undefined
  return { ...node, temperatureK, phase: substance ? phaseAt(substance, temperatureK) : node.phase }
}

const mutate = (nodes: RealityNode[], biome: BiomeKind) => {
  if (biome === 'coast' || biome === 'open') return nodes
  return nodes.map(node => {
    if (biome === 'desert') {
      if (node.id === 'ocean') return heat(setWater(node, 28), 304)
      if (node.id === 'river') return heat(setWater(node, 2), 302)
      if (node.id === 'soil') return heat(setWater(node, 0.4), 306)
      if (node.id === 'cloud') return heat(setWater(node, 0.3), 280)
      if (node.id === 'atmosphere') return heat(setWater(node, 0.08), 268)
      if (node.id === 'tree') return heat(setWater(node, 0.6), 304)
    }
    if (biome === 'alpine') {
      if (node.id === 'ocean') return heat(setWater(node, 60), 268)
      if (node.id === 'river') return heat(setWater(node, 12), 270)
      if (node.id === 'soil') return heat(setWater(node, 1.2), 266)
      if (node.id === 'cloud') return heat(setWater(node, 4), 250)
      if (node.id === 'tree') return heat(setWater(node, 2), 271)
      if (node.id === 'human') return heat(node, 309)
    }
    if (biome === 'forest') {
      if (node.id === 'tree') return { ...node, inventory: setMoles(setMoles(node.inventory ?? [], 'C6H10O5', 14), 'H2O', 16) }
      if (node.id === 'soil') return setWater(node, 10)
      if (node.id === 'atmosphere') return setWater(node, 2.4)
      if (node.id === 'cloud') return setWater(node, 18)
    }
    if (biome === 'wetland') {
      if (node.id === 'soil') return setWater(node, 36)
      if (node.id === 'ocean') return setWater(node, 700)
      if (node.id === 'atmosphere') return setWater(node, 2.8)
    }
    return node
  })
}

export const composeReality = (prompt: string) => {
  const intent = parseIntent(prompt)
  const seeded = seedReality()
  const interpreted = interpretDescription(prompt)
  const base = mutate(cloneNodes(seeded.nodes), intent.biome)
  const extras = interpreted.nodes.filter(item => !base.some(node => node.domain === item.domain && node.kind === item.kind && node.substanceId === item.substanceId))
  const nodes = [...base, ...extras]
  const relations: RealityRelation[] = [...seeded.relations]
  return {
    intent,
    nodes,
    relations,
    interpreted,
    oceanWater: molesOf(nodes.find(item => item.id === 'ocean') ?? nodes[0], 'H2O'),
    meshIsFoundation: false as const,
    heightfieldIsIdentity: false as const,
    pbrIsFoundation: false as const,
  }
}
