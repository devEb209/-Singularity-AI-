import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import { molesOf } from './extent.js'
import { moveMoles } from './pool.js'
import type { RealityNode } from './types.js'

export const aquiferNode = (): RealityNode => ({
  id: 'aquifer',
  kind: 'matter',
  label: 'subsurface water',
  substanceId: 'H2O',
  temperatureK: 284,
  pressurePa: 180000,
  phase: 'liquid',
  extent: { kind: 'box', min: [-6, -3.2, -6], max: [6, -0.8, 6] },
  emissionScale: 0,
  claims: [],
  inventory: [{ substanceId: 'H2O', moles: 4 }],
  domain: 'oceans',
})

export const stepGroundwater = (nodes: RealityNode[]) => {
  const withAquifer = nodes.some(item => item.id === 'aquifer') ? nodes : [...nodes, aquiferNode()]
  const before = waterMoles(withAquifer)
  const down = moveMoles(withAquifer, 'soil', 'aquifer', 'H2O', 0.35)
  const seep = moveMoles(down.nodes, 'aquifer', 'river', 'H2O', 0.12)
  return {
    nodes: seep.nodes,
    before,
    after: waterMoles(seep.nodes),
    conserved: Math.abs(waterMoles(seep.nodes) - before) < 1e-9,
    stored: molesOf(seep.nodes.find(item => item.id === 'aquifer')!, 'H2O') > 4,
    shaderWater: false as const,
  }
}

export const compareGroundwater = (prompt = 'floresta com um humano e um abrigo') => {
  const stepped = stepGroundwater(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, stored: stepped.stored, shaderWater: stepped.shaderWater }
}
