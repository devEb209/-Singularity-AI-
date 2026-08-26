import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import { molesOf } from './extent.js'
import { moveMoles } from './pool.js'

export const stepDew = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const cloud = nodes.find(item => item.id === 'cloud')
  const cold = Boolean(cloud && cloud.temperatureK < 275 && molesOf(cloud, 'H2O') > 1)
  const before = waterMoles(nodes)
  const dew = cold ? moveMoles(nodes, 'cloud', 'soil', 'H2O', 0.35) : { nodes, take: 0 }
  const fog = cold && dew.nodes.find(item => item.id === 'atmosphere')
    ? { ...dew, nodes: dew.nodes.map(node => (node.id === 'atmosphere' ? { ...node, claims: [...node.claims, { id: 'fog-claim', statement: 'condensed vapor near ground', state: 'KNOWN' as const, inferred: false, source: 'dew-fog' }] } : node)) }
    : dew
  return {
    nodes: fog.nodes,
    before,
    after: waterMoles(fog.nodes),
    conserved: Math.abs(waterMoles(fog.nodes) - before) < 1e-9,
    dew: dew.take > 0,
    shaderFog: false as const,
  }
}

export const compareDew = (prompt = 'oceano salgado sob céu nublado') => {
  const stepped = stepDew(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, dew: stepped.dew, shaderFog: stepped.shaderFog }
}
