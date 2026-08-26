import { composeReality } from './compose.js'
import { molesOf } from './extent.js'
import { waterMoles } from './exchange.js'
import { moveMoles } from './pool.js'

export const stepDrought = (nodes: ReturnType<typeof composeReality>['nodes']) => {
  const before = waterMoles(nodes)
  const dry = moveMoles(nodes, 'soil', 'atmosphere', 'H2O', 1.2)
  return {
    nodes: dry.nodes,
    before,
    after: waterMoles(dry.nodes),
    conserved: Math.abs(waterMoles(dry.nodes) - before) < 1e-9,
    drier: molesOf(dry.nodes.find(item => item.id === 'soil')!, 'H2O') < molesOf(nodes.find(item => item.id === 'soil')!, 'H2O'),
    shaderDrought: false as const,
  }
}

export const compareDrought = () => {
  const desert = stepDrought(composeReality('deserto quente e árido').nodes)
  const forest = stepDrought(composeReality('floresta com um humano').nodes)
  return {
    conserved: desert.conserved && forest.conserved,
    desertDrierSoil: molesOf(desert.nodes.find(item => item.id === 'soil')!, 'H2O') < molesOf(forest.nodes.find(item => item.id === 'soil')!, 'H2O'),
    shaderDrought: false as const,
  }
}
