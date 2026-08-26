import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import type { RealityNode } from './types.js'

export const horizonsOf = (soil?: RealityNode) => {
  const organics = soil ? molesOf(soil, 'C6H10O5') : 0
  const water = soil ? molesOf(soil, 'H2O') : 0
  const mineral = soil ? molesOf(soil, 'SiO2') + molesOf(soil, 'Fe2O3') : 0
  return {
    o: organics,
    a: water,
    c: mineral,
    layered: organics > 0 && mineral > organics,
    textureSplats: false as const,
  }
}

export const compareSoilHorizon = () => {
  const forest = horizonsOf(composeWithStructures('floresta com um humano e um abrigo').nodes.find(item => item.id === 'soil'))
  const desert = horizonsOf(composeWithStructures('deserto quente e árido').nodes.find(item => item.id === 'soil'))
  return {
    forestMoreOrganic: forest.o >= desert.o,
    layered: forest.layered,
    textureSplats: forest.textureSplats,
  }
}
