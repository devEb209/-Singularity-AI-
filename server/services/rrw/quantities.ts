import { geometricMass, inventoryMass } from './extent.js'
import { requireSubstance } from './substances.js'
import type { QuantityBudget, RealityNode } from './types.js'

export const heatCapacity = (node: RealityNode) => {
  const substance = node.substanceId ? requireSubstance(node.substanceId) : undefined
  const mass = Math.max(1e-6, geometricMass(node) || inventoryMass(node.inventory))
  return mass * (substance?.specificHeat ?? 1000)
}

export const thermalEnergy = (node: RealityNode) => heatCapacity(node) * node.temperatureK

export const chargeOf = (node: RealityNode) => node.chargeC ?? 0

export const inventoryMassTotal = (nodes: RealityNode[]) =>
  nodes.reduce((sum, node) => sum + inventoryMass(node.inventory), 0)

export const geometricMassTotal = (nodes: RealityNode[]) =>
  nodes.reduce((sum, node) => sum + geometricMass(node), 0)

export const budgetOf = (nodes: RealityNode[]): QuantityBudget => ({
  mass: inventoryMassTotal(nodes) || geometricMassTotal(nodes),
  energy: nodes.reduce((sum, node) => sum + thermalEnergy(node), 0),
  charge: nodes.reduce((sum, node) => sum + chargeOf(node), 0),
  momentum: [0, 0, 0],
})

export const residual = (before: QuantityBudget, after: QuantityBudget) => {
  const mass = Math.abs(after.mass - before.mass) / Math.max(1e-9, Math.abs(before.mass))
  const energy = Math.abs(after.energy - before.energy) / Math.max(1e-9, Math.abs(before.energy))
  const charge = Math.abs(after.charge - before.charge)
  return { mass, energy, charge }
}

export const conservedEnough = (before: QuantityBudget, after: QuantityBudget, energySink = 0) => {
  const adjusted: QuantityBudget = { ...after, energy: after.energy + energySink }
  const gap = residual(before, adjusted)
  return gap.mass < 1e-6 && gap.energy < 1e-4 && gap.charge < 1e-9
}
