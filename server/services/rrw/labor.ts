import { cellulosePool } from './economy.js'
import { molesOf, setMoles } from './extent.js'
import { composeWithStructures } from './structure.js'
import type { RealityNode } from './types.js'

const celluloseOf = (node: RealityNode) => molesOf(node, 'C6H10O5')

const withCellulose = (node: RealityNode, moles: number): RealityNode =>
  ({ ...node, inventory: setMoles(node.inventory ?? [], 'C6H10O5', Math.max(0, moles)) })

export const stepLabor = (nodes: RealityNode[]) => {
  const before = cellulosePool(nodes)
  const tree = nodes.find(item => item.id === 'tree')
  const shelter = nodes.find(item => item.id === 'shelter')
  const human = nodes.find(item => item.id === 'human')
  const take = tree && shelter && human ? Math.min(0.05, celluloseOf(tree) * 0.04) : 0
  const next = nodes.map(node => {
    if (node.id === 'tree') return withCellulose(node, celluloseOf(node) - take)
    if (node.id === 'shelter') return withCellulose(node, celluloseOf(node) + take)
    return node
  })
  return {
    nodes: next,
    before,
    after: cellulosePool(next),
    take,
    conserved: Math.abs(cellulosePool(next) - before) < 1e-9,
    worked: take > 0,
    questLog: false as const,
    consciousnessClaim: false as const,
  }
}

export const compareLabor = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepLabor(composeWithStructures(prompt).nodes)
  return {
    conserved: stepped.conserved,
    worked: stepped.worked,
    questLog: stepped.questLog,
  }
}
