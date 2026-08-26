import { composeWithStructures } from './structure.js'
import { sumMoles, moveMoles } from './pool.js'
import type { RealityNode } from './types.js'

export const stepVolcano = (nodes: RealityNode[]) => {
  const before = sumMoles(nodes, 'SiO2')
  const erupted = moveMoles(nodes, 'outcrop', 'soil', 'SiO2', 0.6)
  const next = erupted.nodes.map(node => (node.id === 'outcrop' ? { ...node, temperatureK: node.temperatureK + 40 } : node))
  const hot = next.find(item => item.id === 'outcrop')!.temperatureK
  return {
    nodes: next,
    before,
    after: sumMoles(next, 'SiO2'),
    conserved: Math.abs(sumMoles(next, 'SiO2') - before) < 1e-9,
    erupted: erupted.take > 0 && hot > (nodes.find(item => item.id === 'outcrop')?.temperatureK ?? 0),
    particleLava: false as const,
  }
}

export const compareVolcano = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const stepped = stepVolcano(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, erupted: stepped.erupted, particleLava: stepped.particleLava }
}
