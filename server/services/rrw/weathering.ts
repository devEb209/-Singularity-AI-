import { composeReality } from './compose.js'
import { molesOf, setMoles } from './extent.js'
import type { RealityNode } from './types.js'

const silica = (node: RealityNode) => molesOf(node, 'SiO2')

const setSilica = (node: RealityNode, moles: number) =>
  ({ ...node, inventory: setMoles(node.inventory ?? [], 'SiO2', Math.max(0, moles)) })

export const silicaMoles = (nodes: RealityNode[]) =>
  nodes.reduce((sum, node) => sum + silica(node), 0)

export const stepWeathering = (nodes: RealityNode[]) => {
  const before = silicaMoles(nodes)
  const outcrop = nodes.find(item => item.id === 'outcrop')
  const soil = nodes.find(item => item.id === 'soil')
  const available = outcrop ? Math.max(0, silica(outcrop) - 1) : 0
  const take = Math.min(available, available * 0.03)
  const next = nodes.map(node => {
    if (node.id === 'outcrop') return setSilica(node, silica(node) - take)
    if (node.id === 'soil') return setSilica(node, silica(node) + take)
    return node
  })
  const after = silicaMoles(next)
  return {
    nodes: next,
    before,
    after,
    take,
    conserved: Math.abs(after - before) < 1e-9,
    heightmapIsIdentity: false as const,
    shaderErosion: false as const,
  }
}

export const compareWeathering = (prompt = 'oceano salgado com rocha') => {
  const stepped = stepWeathering(composeReality(prompt).nodes)
  return {
    conserved: stepped.conserved,
    moved: stepped.take > 0,
    shaderErosion: stepped.shaderErosion,
  }
}
