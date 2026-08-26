import { sunElevation } from './circadian.js'
import { composeReality } from './compose.js'
import { phaseAt } from './matter.js'
import { insolationFactor, latitudeOf, seasonOf, type RealityClock } from './orbit.js'
import { requireSubstance } from './substances.js'
import type { RealityNode } from './types.js'

export const climateNodeIds = new Set(['ocean', 'soil', 'atmosphere', 'terrain', 'river', 'cloud'])

export const climateBaseOf = (nodes: RealityNode[]) =>
  Object.fromEntries(nodes.map(node => [node.id, node.temperatureK]))

export const applyTimeClimate = (nodes: RealityNode[], climateBase: Record<string, number>, clock: RealityClock) => {
  const elevation = sunElevation(clock.hour)
  return nodes.map(node => {
    if (node.id === 'star-sol') return { ...node, emissionScale: 0.12 + elevation * 0.88 }
    if (!climateNodeIds.has(node.id)) return node
    const base = climateBase[node.id] ?? node.temperatureK
    const seasonal = (insolationFactor(latitudeOf(node.id), clock.dayOfYear) - 0.62) * 22
    const daily = (elevation - 0.5) * 6
    const temperatureK = base + seasonal + daily
    const substance = node.substanceId ? requireSubstance(node.substanceId) : undefined
    return {
      ...node,
      temperatureK,
      phase: substance ? phaseAt(substance, temperatureK) : node.phase,
    }
  })
}

export const compareSeasons = (prompt = 'oceano salgado com fogo') => {
  const composed = composeReality(prompt)
  const base = climateBaseOf(composed.nodes)
  const winter = applyTimeClimate(composed.nodes, base, { hour: 12, dayOfYear: 15, moon: 0 })
  const summer = applyTimeClimate(composed.nodes, base, { hour: 12, dayOfYear: 200, moon: 0 })
  const winterOcean = winter.find(item => item.id === 'ocean')!
  const summerOcean = summer.find(item => item.id === 'ocean')!
  const alpine = composeReality('neve alpina no cume')
  const alpineBase = climateBaseOf(alpine.nodes)
  const alpineWinter = applyTimeClimate(alpine.nodes, alpineBase, { hour: 12, dayOfYear: 15, moon: 0 })
  const alpineOcean = alpineWinter.find(item => item.id === 'ocean')!
  return {
    biome: composed.intent.biome,
    winterOcean: winterOcean.temperatureK,
    summerOcean: summerOcean.temperatureK,
    summerWarmer: summerOcean.temperatureK > winterOcean.temperatureK,
    winterSeason: seasonOf(15),
    summerSeason: seasonOf(200),
    alpineWinterPhase: alpineOcean.phase,
    alpineStaysCold: alpineOcean.temperatureK < 273.15,
    skybox: false as const,
    shaderSeason: false as const,
  }
}
