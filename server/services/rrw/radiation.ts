import { volumeOf } from './extent.js'
import { requireSubstance } from './substances.js'
import type { RealityNode } from './types.js'

const SIGMA = 5.670374419e-8

export const stefanBoltzmann = (temperatureK: number) => SIGMA * temperatureK ** 4

export const emitThermal = (node: RealityNode) => {
  const area = node.extent.kind === 'sphere' && node.extent.radius
    ? 4 * Math.PI * node.extent.radius ** 2
    : Math.cbrt(volumeOf(node)) ** 2
  return stefanBoltzmann(node.temperatureK) * Math.max(1e-6, area) * Math.max(0.01, node.emissionScale || 0.05)
}

export const absorbRadiation = (node: RealityNode, incident: number, path = 1) => {
  const substance = node.substanceId ? requireSubstance(node.substanceId) : undefined
  const mu = substance ? (substance.optical.absorption.fir + substance.optical.absorption.red) / 2 : 0.05
  return incident * (1 - Math.exp(-mu * path))
}

export const compareEmitters = (nodes: RealityNode[]) => {
  const star = nodes.find(item => item.id === 'star-sol')
  const planet = nodes.find(item => item.id === 'planet-ref')
  const starPower = star ? emitThermal(star) : 0
  const planetPower = planet ? emitThermal(planet) : 0
  return {
    starPower,
    planetPower,
    starHotter: starPower > planetPower,
    pathTraced: false as const,
  }
}
