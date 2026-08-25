import { composeReality } from './compose.js'
import { molesOf, setMoles } from './extent.js'
import type { RealityNode } from './types.js'

const cellulose = (node: RealityNode) => molesOf(node, 'C6H10O5')

const setCellulose = (node: RealityNode, moles: number) =>
  ({ ...node, inventory: setMoles(node.inventory ?? [], 'C6H10O5', Math.max(0, moles)) })

export const celluloseMoles = (nodes: RealityNode[]) =>
  nodes.reduce((sum, node) => sum + cellulose(node), 0)

export const stepSoil = (nodes: RealityNode[]) => {
  const before = celluloseMoles(nodes)
  const tree = nodes.find(item => item.id === 'tree')
  const soil = nodes.find(item => item.id === 'soil')
  const litter = tree ? cellulose(tree) * 0.04 : 0
  const uptake = soil ? cellulose(soil) * 0.025 : 0
  const next = nodes.map(node => {
    if (node.id === 'tree') return setCellulose(node, cellulose(node) - litter + uptake)
    if (node.id === 'soil') return setCellulose(node, cellulose(node) + litter - uptake)
    return node
  })
  const after = celluloseMoles(next)
  return {
    nodes: next,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    litter,
    uptake,
    textureVegetation: false as const,
  }
}

export const compareSoil = (prompt = 'floresta com um humano') => {
  const composed = composeReality(prompt)
  const stepped = stepSoil(composed.nodes)
  return {
    conserved: stepped.conserved,
    treeLostLitter: stepped.litter > 0,
    textureVegetation: stepped.textureVegetation,
  }
}
