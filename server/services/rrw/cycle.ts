import { fractionOf } from './atmosphere.js'
import { molesOf } from './extent.js'
import type { RealityNode } from './types.js'

export const carbonBudget = (nodes: RealityNode[]) => {
  const air = nodes.find(item => item.id === 'atmosphere')
  const tree = nodes.find(item => item.id === 'tree')
  const fire = nodes.find(item => item.id === 'fire')
  const human = nodes.find(item => item.id === 'human')
  const co2 = (air ? molesOf(air, 'CO2') : 0) + (fire ? molesOf(fire, 'CO2') : 0)
  const organics = (tree ? molesOf(tree, 'C6H10O5') : 0) + (human ? molesOf(human, 'C6H12O6') : 0)
  return { co2, organics, total: co2 + organics * 6 }
}

export const waterBudget = (nodes: RealityNode[]) => {
  const ocean = nodes.find(item => item.id === 'ocean')
  const cloud = nodes.find(item => item.id === 'cloud')
  const air = nodes.find(item => item.id === 'atmosphere')
  return {
    ocean: ocean ? molesOf(ocean, 'H2O') : 0,
    vapor: (cloud ? molesOf(cloud, 'H2O') : 0) + (air ? molesOf(air, 'H2O') : 0),
  }
}

export const describeCycles = (nodes: RealityNode[]) => {
  const air = nodes.find(item => item.id === 'atmosphere')
  return {
    carbon: carbonBudget(nodes),
    water: waterBudget(nodes),
    oxygenFraction: air ? fractionOf(air.inventory ?? [], 'O2') : 0,
    closedWorld: false as const,
  }
}
