import { composeWithStructures } from './structure.js'
import { atomC, convertMoles } from './pool.js'
import { setMoles, molesOf } from './extent.js'

export const stepDecayLife = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const dry = nodes.map(node => (node.id === 'animal' ? { ...node, inventory: setMoles(node.inventory ?? [], 'C6H12O6', Math.min(0.05, molesOf(node, 'C6H12O6'))) } : node))
  const before = atomC(dry)
  const decayed = convertMoles(dry, 'animal', 'C6H12O6', 1, 'soil', 'C6H10O5', 1, 0.04)
  const after = atomC(decayed.nodes)
  return {
    nodes: decayed.nodes,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    decayed: decayed.take > 0,
    consciousnessClaim: false as const,
  }
}

export const compareDecayLife = (prompt = 'oceano salgado com um humano') => {
  const stepped = stepDecayLife(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, decayed: stepped.decayed, consciousnessClaim: stepped.consciousnessClaim }
}
