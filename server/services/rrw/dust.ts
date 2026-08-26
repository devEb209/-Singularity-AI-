import { composeWithStructures } from './structure.js'
import { sumMoles, moveMoles } from './pool.js'

export const stepDust = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = sumMoles(nodes, 'SiO2')
  const lifted = moveMoles(nodes, 'soil', 'atmosphere', 'SiO2', 0.25)
  return {
    nodes: lifted.nodes,
    before,
    after: sumMoles(lifted.nodes, 'SiO2'),
    conserved: Math.abs(sumMoles(lifted.nodes, 'SiO2') - before) < 1e-9,
    lifted: lifted.take > 0,
    particleDust: false as const,
  }
}

export const compareDust = (prompt = 'deserto quente e árido com um humano') => {
  const stepped = stepDust(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, lifted: stepped.lifted, particleDust: stepped.particleDust }
}
