import { molesOf, setMoles } from './extent.js'
import type { RealityNode } from './types.js'

export const waterMoles = (nodes: RealityNode[]) =>
  nodes.reduce((sum, node) => sum + molesOf(node, 'H2O'), 0)

const addWater = (node: RealityNode, delta: number) =>
  ({ ...node, inventory: setMoles(node.inventory ?? [], 'H2O', Math.max(0, molesOf(node, 'H2O') + delta)) })

export const exchangeWater = (nodes: RealityNode[], rain = 0, evap = 0) => {
  const before = waterMoles(nodes)
  const ocean = nodes.find(item => item.id === 'ocean')
  const air = nodes.find(item => item.id === 'atmosphere')
  const soil = nodes.find(item => item.id === 'soil')
  const cloud = nodes.find(item => item.id === 'cloud')
  const availableVapor = (air ? molesOf(air, 'H2O') : 0) + (cloud ? molesOf(cloud, 'H2O') : 0)
  const rainTake = Math.min(Math.max(0, rain), availableVapor)
  const oceanPool = ocean ? molesOf(ocean, 'H2O') : 0
  const evapTake = Math.min(Math.max(0, evap), oceanPool)
  const next = nodes.map(node => {
    if (node.id === 'cloud') return addWater(node, -rainTake * 0.6)
    if (node.id === 'atmosphere') return addWater(node, -rainTake * 0.4 + evapTake)
    if (node.id === 'ocean') return addWater(node, rainTake * 0.7 - evapTake)
    if (node.id === 'soil') return addWater(node, rainTake * 0.3)
    return node
  })
  const after = waterMoles(next)
  return {
    nodes: next,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    rainTake,
    evapTake,
    shaderWater: false as const,
  }
}

export const stepExchange = (nodes: RealityNode[], ticks = 4) => {
  let current = nodes
  let conserved = true
  for (let i = 0; i < ticks; i++) {
    const dry = exchangeWater(current, 0, 0)
    conserved = conserved && dry.conserved
    const wet = exchangeWater(dry.nodes, 0.2, 0.2)
    conserved = conserved && wet.conserved
    current = wet.nodes
  }
  return { nodes: current, ticks, conserved, water: waterMoles(current) }
}
