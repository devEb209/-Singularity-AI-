import { composeWithStructures } from './structure.js'
import { moveMoles, sumMoles } from './pool.js'

export const stepErosion = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = sumMoles(nodes, 'SiO2')
  const toSoil = moveMoles(nodes, 'outcrop', 'soil', 'SiO2', 0.4)
  const toRiver = moveMoles(toSoil.nodes, 'soil', 'river', 'SiO2', 0.08)
  const after = sumMoles(toRiver.nodes, 'SiO2')
  return {
    nodes: toRiver.nodes,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    moved: toSoil.take + toRiver.take > 0,
    heightmapIsIdentity: false as const,
    shaderErosion: false as const,
  }
}

export const compareErosion = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const stepped = stepErosion(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, moved: stepped.moved, shaderErosion: stepped.shaderErosion }
}
