import { composeReality } from './compose.js'
import { molesOf, setMoles } from './extent.js'
import type { RealityNode } from './types.js'

const cellulose = (node: RealityNode) => molesOf(node, 'C6H10O5')

const setCellulose = (node: RealityNode, moles: number) =>
  ({ ...node, inventory: setMoles(node.inventory ?? [], 'C6H10O5', Math.max(0, moles)) })

export const cellulosePool = (nodes: RealityNode[]) =>
  nodes.reduce((sum, node) => sum + cellulose(node), 0)

export const stepForage = (nodes: RealityNode[]) => {
  const before = cellulosePool(nodes)
  const tree = nodes.find(item => item.id === 'tree')
  const human = nodes.find(item => item.id === 'human')
  const take = tree ? Math.min(0.2, cellulose(tree) * 0.06) : 0
  const next = nodes.map(node => {
    if (node.id === 'tree') return setCellulose(node, cellulose(node) - take)
    if (node.id === 'human') return setCellulose(node, cellulose(node) + take)
    return node
  })
  return {
    nodes: next,
    before,
    after: cellulosePool(next),
    take,
    conserved: Math.abs(cellulosePool(next) - before) < 1e-9,
    foraged: take > 0 && Boolean(human),
    scriptedLoot: false as const,
    uniqueFullMinds: false as const,
  }
}

export const compareEconomy = (prompt = 'floresta com um humano') => {
  const stepped = stepForage(composeReality(prompt).nodes)
  return {
    conserved: stepped.conserved,
    foraged: stepped.foraged,
    scriptedLoot: stepped.scriptedLoot,
  }
}
