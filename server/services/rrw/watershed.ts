import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import { molesOf } from './extent.js'
import { moveMoles } from './pool.js'

export const stepWatershed = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const before = waterMoles(nodes)
  const toRiver = moveMoles(nodes, 'soil', 'river', 'H2O', 0.25)
  const toOcean = moveMoles(toRiver.nodes, 'river', 'ocean', 'H2O', 0.2)
  const river = toOcean.nodes.find(item => item.id === 'river')
  return {
    nodes: toOcean.nodes,
    before,
    after: waterMoles(toOcean.nodes),
    conserved: Math.abs(waterMoles(toOcean.nodes) - before) < 1e-9,
    drained: toRiver.take > 0,
    riverAlive: Boolean(river && molesOf(river, 'H2O') > 0),
    gisCatchment: false as const,
  }
}

export const compareWatershed = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = stepWatershed(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, drained: stepped.drained, gisCatchment: stepped.gisCatchment }
}
