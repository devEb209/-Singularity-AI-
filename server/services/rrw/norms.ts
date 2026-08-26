import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'
import { moveMoles } from './pool.js'
import type { RealityNode } from './types.js'

export const stepNorms = (nodes: RealityNode[]) => {
  const tree = nodes.find(item => item.id === 'tree')
  const reserve = tree ? Math.max(0.8, molesOf(tree, 'C6H10O5') * 0.2) : 0
  const available = tree ? Math.max(0, molesOf(tree, 'C6H10O5') - reserve) : 0
  const taken = moveMoles(nodes, 'tree', 'human', 'C6H10O5', Math.min(0.15, available))
  const claim = {
    id: 'norm-last-grove',
    statement: 'norm: do not take the last grove reserve',
    state: 'KNOWN' as const,
    inferred: false,
    source: 'norms',
  }
  const next = taken.nodes.map(node => (node.id === 'human' ? { ...node, claims: [...node.claims, claim] } : node))
  const afterTree = next.find(item => item.id === 'tree')
  return {
    nodes: next,
    reserved: Boolean(afterTree && molesOf(afterTree, 'C6H10O5') >= reserve - 1e-9),
    took: taken.take > 0,
    uniqueFullMinds: false as const,
  }
}

export const compareNorms = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepNorms(composeWithStructures(prompt).nodes)
  return { reserved: stepped.reserved, took: stepped.took, uniqueFullMinds: stepped.uniqueFullMinds }
}
