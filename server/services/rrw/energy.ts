import { cloneNodes, distanceBetween } from './extent.js'
import { budgetOf, heatCapacity, thermalEnergy } from './quantities.js'
import { requireSubstance } from './substances.js'
import type { RealityNode } from './types.js'

export const applyHeat = (node: RealityNode, joules: number) => {
  const capacity = heatCapacity(node)
  return { ...node, temperatureK: node.temperatureK + joules / capacity }
}

export const exchangePair = (a: RealityNode, b: RealityNode, mix: number) => {
  const ca = heatCapacity(a)
  const cb = heatCapacity(b)
  const total = ca * a.temperatureK + cb * b.temperatureK
  const equilibrium = total / (ca + cb)
  const amount = Math.max(0, Math.min(1, mix))
  return [
    { ...a, temperatureK: a.temperatureK + (equilibrium - a.temperatureK) * amount },
    { ...b, temperatureK: b.temperatureK + (equilibrium - b.temperatureK) * amount },
  ] as const
}

export const stepEnergy = (nodes: RealityNode[], dt = 1, ambientK = 288) => {
  const before = budgetOf(nodes)
  let next = cloneNodes(nodes)
  let sink = 0
  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const a = next[i]
      const b = next[j]
      const dist = Math.max(0.2, distanceBetween(a, b))
      const ka = a.substanceId ? requireSubstance(a.substanceId).thermalConductivity : 0.02
      const kb = b.substanceId ? requireSubstance(b.substanceId).thermalConductivity : 0.02
      const mix = Math.min(0.35, ((ka + kb) * dt) / (80 * dist))
      if (mix <= 1e-8) continue
      const [na, nb] = exchangePair(a, b, mix)
      next[i] = na
      next[j] = nb
    }
  }
  next = next.map(node => {
    const capacity = heatCapacity(node)
    const beforeE = thermalEnergy(node)
    const mix = node.id === 'fire' ? Math.min(1, dt * 0.15) : Math.min(0.08, dt * 0.02)
    const target = node.id === 'fire' ? ambientK + 400 : ambientK
    const afterT = node.temperatureK + (target - node.temperatureK) * mix
    const afterE = capacity * afterT
    sink += beforeE - afterE
    return { ...node, temperatureK: afterT }
  })
  const after = budgetOf(next)
  return {
    nodes: next,
    before,
    after,
    sink,
    conservedWithSink: Math.abs((after.energy + sink) - before.energy) / Math.max(1, Math.abs(before.energy)) < 1e-6,
    shaderHeat: false as const,
  }
}

export const depositHeat = (nodes: RealityNode[], joules: number, prefer = 'fire') => {
  const host = nodes.find(item => item.id === prefer) ?? nodes[0]
  if (!host || Math.abs(joules) < 1e-12) return nodes
  return nodes.map(node => (node.id === host.id ? applyHeat(node, joules) : node))
}
