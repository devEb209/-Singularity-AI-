import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import { molesOf } from './extent.js'
import { applyTimeClimate, climateBaseOf } from './season.js'
import type { RealityNode } from './types.js'

export const stepGlacier = (nodes: RealityNode[]) => {
  const alpine = applyTimeClimate(nodes, climateBaseOf(nodes), { hour: 2, dayOfYear: 15, moon: 0 })
  const before = waterMoles(alpine)
  const next = alpine.map(node => {
    if (node.id !== 'soil' && node.id !== 'ocean' && node.id !== 'river') return node
    if (node.temperatureK >= 273.15) return node
    return { ...node, phase: 'solid' as const }
  })
  const ice = next.filter(item => item.phase === 'solid' && molesOf(item, 'H2O') > 0).length
  return {
    nodes: next,
    before,
    after: waterMoles(next),
    conserved: Math.abs(waterMoles(next) - before) < 1e-9,
    iced: ice > 0,
    shaderIce: false as const,
  }
}

export const compareGlacier = () => {
  const alpine = stepGlacier(composeWithStructures('neve alpina no cume com um humano').nodes)
  const coast = stepGlacier(composeWithStructures('oceano salgado com um humano e um abrigo').nodes)
  return { alpineIced: alpine.iced, conserved: alpine.conserved && coast.conserved, shaderIce: alpine.shaderIce }
}
