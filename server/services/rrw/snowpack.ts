import { composeWithStructures } from './structure.js'
import { waterMoles } from './exchange.js'
import { molesOf, setMoles } from './extent.js'
import { applyTimeClimate, climateBaseOf } from './season.js'

export const stepSnowpack = (nodes: ReturnType<typeof composeWithStructures>['nodes']) => {
  const winter = applyTimeClimate(nodes, climateBaseOf(nodes), { hour: 8, dayOfYear: 20, moon: 0.2 })
  const before = waterMoles(winter)
  const next = winter.map(node => {
    if (node.id !== 'soil' && node.id !== 'cloud') return node
    if (node.temperatureK >= 273.15) return node
    const extra = node.id === 'cloud' ? 0 : 0
    return { ...node, phase: 'solid' as const, inventory: setMoles(node.inventory ?? [], 'H2O', molesOf(node, 'H2O') + extra) }
  })
  return {
    nodes: next,
    before,
    after: waterMoles(next),
    conserved: Math.abs(waterMoles(next) - before) < 1e-9,
    packed: next.some(item => item.id === 'soil' && item.phase === 'solid'),
    shaderSnow: false as const,
  }
}

export const compareSnowpack = () => {
  const alpine = stepSnowpack(composeWithStructures('neve alpina no cume com um humano').nodes)
  return { packed: alpine.packed, conserved: alpine.conserved, shaderSnow: alpine.shaderSnow }
}
