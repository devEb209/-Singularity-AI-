import { molesOf, setMoles } from './extent.js'
import { requireSubstance } from './substances.js'
import type { MixturePart, RealityNode } from './types.js'

export interface Stoich {
  id: string
  moles: number
}

export interface Reaction {
  id: string
  name: string
  reactants: Stoich[]
  products: Stoich[]
  enthalpyKJ: number
  minK: number
  maxK: number
  rate: number
}

export const reactions: Reaction[] = [
  { id: 'combustion-c', name: 'carbon combustion', reactants: [{ id: 'C', moles: 1 }, { id: 'O2', moles: 1 }], products: [{ id: 'CO2', moles: 1 }], enthalpyKJ: -393.5, minK: 600, maxK: 4000, rate: 0.35 },
  { id: 'water-formation', name: 'hydrogen oxidation', reactants: [{ id: 'H2', moles: 2 }, { id: 'O2', moles: 1 }], products: [{ id: 'H2O', moles: 2 }], enthalpyKJ: -571.6, minK: 400, maxK: 3500, rate: 0.4 },
  { id: 'methane-burn', name: 'methane combustion', reactants: [{ id: 'CH4', moles: 1 }, { id: 'O2', moles: 2 }], products: [{ id: 'CO2', moles: 1 }, { id: 'H2O', moles: 2 }], enthalpyKJ: -890.3, minK: 550, maxK: 3500, rate: 0.3 },
  { id: 'photosynthesis', name: 'cellulose photosynthesis proxy', reactants: [{ id: 'CO2', moles: 6 }, { id: 'H2O', moles: 5 }], products: [{ id: 'C6H10O5', moles: 1 }, { id: 'O2', moles: 6 }], enthalpyKJ: 2800, minK: 273, maxK: 320, rate: 0.08 },
  { id: 'respiration', name: 'glucose respiration proxy', reactants: [{ id: 'C6H12O6', moles: 1 }, { id: 'O2', moles: 6 }], products: [{ id: 'CO2', moles: 6 }, { id: 'H2O', moles: 6 }], enthalpyKJ: -2800, minK: 280, maxK: 330, rate: 0.12 },
]

const poolOf = (nodes: RealityNode[]) => {
  const pool = new Map<string, number>()
  for (const node of nodes) {
    for (const part of node.inventory ?? []) pool.set(part.substanceId, (pool.get(part.substanceId) ?? 0) + part.moles)
  }
  return pool
}

const writePool = (nodes: RealityNode[], pool: Map<string, number>) => {
  const remaining = new Map(pool)
  return nodes.map(node => {
    if (!node.inventory) return node
    const next: MixturePart[] = []
    for (const part of node.inventory) {
      const available = remaining.get(part.substanceId) ?? 0
      const take = Math.min(part.moles, available)
      remaining.set(part.substanceId, available - take)
      if (take > 1e-12) next.push({ substanceId: part.substanceId, moles: take })
    }
    return { ...node, inventory: next }
  })
}

const deposit = (nodes: RealityNode[], substanceId: string, moles: number, prefer: string[]) => {
  if (moles <= 1e-12) return nodes
  const host = prefer.map(id => nodes.find(item => item.id === id)).find(Boolean) ?? nodes.find(item => item.inventory)
  if (!host) return nodes
  return nodes.map(node => {
    if (node.id !== host.id) return node
    const inventory = setMoles(node.inventory ?? [], substanceId, molesOf(node, substanceId) + moles)
    return { ...node, inventory }
  })
}

export const applyReaction = (nodes: RealityNode[], reaction: Reaction, dt: number, hostId?: string) => {
  const host = hostId ? nodes.find(item => item.id === hostId) : nodes.find(item => item.temperatureK >= reaction.minK && item.temperatureK <= reaction.maxK)
  if (!host || host.temperatureK < reaction.minK || host.temperatureK > reaction.maxK) {
    return { nodes, progressed: 0, heatJ: 0, reaction: reaction.id }
  }
  const pool = poolOf(nodes)
  const available = Math.min(...reaction.reactants.map(item => (pool.get(item.id) ?? 0) / item.moles))
  const progressed = Math.max(0, Math.min(available, reaction.rate * dt))
  if (progressed <= 1e-12) return { nodes, progressed: 0, heatJ: 0, reaction: reaction.id }
  for (const item of reaction.reactants) pool.set(item.id, (pool.get(item.id) ?? 0) - item.moles * progressed)
  let next = writePool(nodes, pool)
  const prefer = [host.id, 'atmosphere', 'ocean', 'fire', 'tree', 'human']
  for (const item of reaction.products) next = deposit(next, item.id, item.moles * progressed, prefer)
  const heatJ = -reaction.enthalpyKJ * 1000 * progressed
  return { nodes: next, progressed, heatJ, reaction: reaction.id }
}

export const stepChemistry = (nodes: RealityNode[], dt = 1) => {
  let next = nodes
  let heatJ = 0
  const events: { reaction: string; progressed: number }[] = []
  const order: { reaction: Reaction; host?: string }[] = [
    { reaction: reactions[0], host: 'fire' },
    { reaction: reactions[3], host: 'tree' },
    { reaction: reactions[4], host: 'human' },
    { reaction: reactions[1] },
    { reaction: reactions[2] },
  ]
  for (const item of order) {
    const result = applyReaction(next, item.reaction, dt, item.host)
    next = result.nodes
    heatJ += result.heatJ
    if (result.progressed > 0) events.push({ reaction: result.reaction, progressed: Number(result.progressed.toFixed(6)) })
  }
  return { nodes: next, heatJ, events, particleSystem: false as const }
}

export const molarMassBalance = (reaction: Reaction) => {
  const left = reaction.reactants.reduce((sum, item) => sum + requireSubstance(item.id).molarMass * item.moles, 0)
  const right = reaction.products.reduce((sum, item) => sum + requireSubstance(item.id).molarMass * item.moles, 0)
  return { left, right, relative: Math.abs(left - right) / left }
}
