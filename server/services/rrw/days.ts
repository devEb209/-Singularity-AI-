import { applyRefine } from './apply-refine.js'
import { stepChemistry } from './chemistry.js'
import { composeReality } from './compose.js'
import { stepEcology } from './ecology.js'
import { depositHeat, stepEnergy } from './energy.js'
import { stepExchange, waterMoles } from './exchange.js'
import { stepOrganisms } from './organism.js'
import type { RealityNode } from './types.js'

const hour = (nodes: RealityNode[]) => {
  const chemistry = stepChemistry(nodes, 1)
  const heated = depositHeat(chemistry.nodes, chemistry.heatJ, 'fire')
  const energy = stepEnergy(heated, 1)
  const ecology = stepEcology(energy.nodes, 1)
  const exchanged = stepExchange(ecology.nodes, 1)
  const living = stepOrganisms(exchanged.nodes)
  return applyRefine(living).nodes
}

export const evolveFrom = (nodes: RealityNode[], steps: number) => {
  let current = nodes
  for (let i = 0; i < steps; i++) current = hour(current)
  return current
}

export const evolveDays = (prompt: string, days = 2) => {
  const composed = composeReality(prompt)
  const fire0 = composed.nodes.find(item => item.id === 'fire')!.temperatureK
  const water0 = waterMoles(composed.nodes)
  const steps = days * 4
  const nodes = evolveFrom(composed.nodes, steps)
  const fire1 = nodes.find(item => item.id === 'fire')!.temperatureK
  const ocean = nodes.find(item => item.id === 'ocean')
  return {
    days,
    steps,
    biome: composed.intent.biome,
    fireBefore: fire0,
    fireAfter: fire1,
    fireCooled: fire1 < fire0,
    water: waterMoles(nodes),
    waterStart: water0,
    oceanPhase: ocean?.phase,
    nodes: nodes.length,
    meshIsFoundation: false as const,
  }
}
