import { composeWithStructures } from './structure.js'
import { magneticFieldAt, magneticStrength } from './magnetism.js'
import type { RealityNode } from './types.js'

const withPlanetMoment = (nodes: RealityNode[]) =>
  nodes.map(node => (node.id === 'planet-ref' && !node.magneticMoment ? { ...node, magneticMoment: [0, 8e4, 0] as [number, number, number] } : node))

export const stepMagnetosphere = (nodes: RealityNode[]) => {
  const next = withPlanetMoment(nodes)
  const surface = magneticStrength(magneticFieldAt(next, [0, 1, 0]))
  const far = magneticStrength(magneticFieldAt(next, [0, 400, 0]))
  return {
    nodes: next,
    surface,
    far,
    strongerNear: surface > far,
    dipoleAsset: false as const,
    nasaField: false as const,
  }
}

export const compareMagnetosphere = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepMagnetosphere(composeWithStructures(prompt).nodes)
  return { strongerNear: stepped.strongerNear, dipoleAsset: stepped.dipoleAsset, nasaField: stepped.nasaField }
}
