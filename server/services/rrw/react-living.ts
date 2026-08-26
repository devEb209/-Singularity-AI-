import { decideFromReality } from './bind-needs.js'
import { remember } from './chronicle.js'
import { stepForage } from './economy.js'
import { setMoles } from './extent.js'
import { composeWithStructures } from './structure.js'
import { applyTimeClimate, climateBaseOf } from './season.js'
import type { RealityNode } from './types.js'

const withInventory = (nodes: RealityNode[], id: string, substanceId: string, moles: number) =>
  nodes.map(node => (node.id === id ? { ...node, inventory: setMoles(node.inventory ?? [], substanceId, moles) } : node))

export const reactLiving = (nodes: RealityNode[]) => {
  const human = nodes.find(item => item.id === 'human')
  if (!human) return { nodes, action: 'none' as const, needs: { energy: 0, water: 0, oxygen: 0, temperatureOk: false }, remembered: false as const }
  const decision = decideFromReality(human, nodes)
  let next = nodes
  if (decision.action === 'forage') next = stepForage(next).nodes
  const recorded = remember(next, `human:${decision.action} energy=${decision.needs.energy.toFixed(2)} water=${decision.needs.water.toFixed(2)}`)
  return {
    nodes: recorded.nodes,
    action: decision.action,
    needs: decision.needs,
    remembered: true as const,
    consciousnessClaim: false as const,
  }
}

export const compareReactions = () => {
  const alpine = applyTimeClimate(
    composeWithStructures('neve alpina no cume com um humano').nodes,
    climateBaseOf(composeWithStructures('neve alpina no cume com um humano').nodes),
    { hour: 2, dayOfYear: 15, moon: 0 },
  )
  const cold = reactLiving(alpine)
  const shelteredNodes = applyTimeClimate(
    composeWithStructures('neve alpina no cume com um humano e um abrigo').nodes,
    climateBaseOf(composeWithStructures('neve alpina no cume com um humano e um abrigo').nodes),
    { hour: 2, dayOfYear: 15, moon: 0 },
  )
  const inside = reactLiving(shelteredNodes)
  const dry = reactLiving(withInventory(composeWithStructures('oceano salgado com um humano e um abrigo').nodes, 'human', 'H2O', 0.1))
  const hungryBase = withInventory(withInventory(composeWithStructures('floresta com um humano e um abrigo').nodes, 'human', 'C6H12O6', 0), 'human', 'C6H10O5', 0)
  const hungry = reactLiving(hungryBase)
  return {
    coldSeeksShelter: cold.action === 'seek-shelter',
    drySeeksWater: dry.action === 'seek-water',
    hungryForages: hungry.action === 'forage',
    shelteredWarmerAction: inside.action !== 'seek-shelter' || inside.needs.temperatureOk,
    remembered: cold.remembered && dry.remembered,
    consciousnessClaim: false as const,
  }
}
