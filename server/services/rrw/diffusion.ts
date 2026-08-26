import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import { moveMoles } from './pool.js'

export const stepDiffusion = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = waterMoles(nodes)
  const toAir = moveMoles(nodes, 'ocean', 'atmosphere', 'H2O', 0.4)
  const back = moveMoles(toAir.nodes, 'atmosphere', 'ocean', 'H2O', 0.15)
  const after = waterMoles(back.nodes)
  return {
    nodes: back.nodes,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    mixed: toAir.take > 0,
    shaderMix: false as const,
  }
}

export const compareDiffusion = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepDiffusion(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, mixed: stepped.mixed, shaderMix: stepped.shaderMix }
}
