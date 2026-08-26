import { molesOf, setMoles } from './extent.js'
import type { RealityNode } from './types.js'

export const sumMoles = (nodes: RealityNode[], substanceId: string) =>
  nodes.reduce((sum, node) => sum + molesOf(node, substanceId), 0)

export const atomC = (nodes: RealityNode[]) =>
  sumMoles(nodes, 'CO2') + sumMoles(nodes, 'C') + sumMoles(nodes, 'CH4') + 6 * sumMoles(nodes, 'C6H10O5') + 6 * sumMoles(nodes, 'C6H12O6')

export const atomN = (nodes: RealityNode[]) =>
  2 * sumMoles(nodes, 'N2') + sumMoles(nodes, 'NH3') + sumMoles(nodes, 'N')

export const moveMoles = (nodes: RealityNode[], fromId: string, toId: string, substanceId: string, amount: number) => {
  const from = nodes.find(item => item.id === fromId)
  const take = from ? Math.min(Math.max(0, amount), molesOf(from, substanceId)) : 0
  if (take <= 1e-12) return { nodes, take: 0 }
  return {
    nodes: nodes.map(node => {
      if (node.id === fromId) return { ...node, inventory: setMoles(node.inventory ?? [], substanceId, molesOf(node, substanceId) - take) }
      if (node.id === toId) return { ...node, inventory: setMoles(node.inventory ?? [], substanceId, molesOf(node, substanceId) + take) }
      return node
    }),
    take,
  }
}

export const convertMoles = (
  nodes: RealityNode[],
  fromId: string,
  fromSub: string,
  fromMult: number,
  toId: string,
  toSub: string,
  toMult: number,
  progressed: number,
) => {
  const from = nodes.find(item => item.id === fromId)
  const available = from && fromMult > 0 ? molesOf(from, fromSub) / fromMult : 0
  const take = Math.min(Math.max(0, progressed), available)
  if (take <= 1e-12) return { nodes, take: 0 }
  return {
    nodes: nodes.map(node => {
      if (node.id === fromId) return { ...node, inventory: setMoles(node.inventory ?? [], fromSub, molesOf(node, fromSub) - take * fromMult) }
      if (node.id === toId) return { ...node, inventory: setMoles(node.inventory ?? [], toSub, molesOf(node, toSub) + take * toMult) }
      return node
    }),
    take,
  }
}

export const seedIfMissing = (nodes: RealityNode[], id: string, substanceId: string, moles: number) => {
  const host = nodes.find(item => item.id === id)
  if (!host || molesOf(host, substanceId) > 0) return { nodes, seeded: false as const }
  return {
    nodes: nodes.map(node => (node.id === id ? { ...node, inventory: setMoles(node.inventory ?? [], substanceId, moles) } : node)),
    seeded: true as const,
  }
}
