import { evolveFrom } from './days.js'
import { cycleWater } from './hydrology.js'
import { applyTimeClimate } from './season.js'
import { stepSoil } from './soil-cycle.js'
import { applyTide } from './tide.js'
import { stepWeather } from './weather.js'
import type { RealityClock } from './orbit.js'
import type { RealityExtent, RealityNode } from './types.js'

export const advanceHour = (
  nodes: RealityNode[],
  climateBase: Record<string, number>,
  oceanExtent: RealityExtent,
  oceanPressure: number,
  clock: RealityClock,
) => {
  const climate = applyTimeClimate(nodes, climateBase, clock)
  const tide = applyTide(climate, oceanExtent, oceanPressure, clock.moon)
  const weather = stepWeather(tide, 1)
  const hydro = cycleWater(weather.nodes, 1)
  const soil = stepSoil(hydro.nodes)
  const evolved = evolveFrom(soil.nodes, 1)
  return {
    nodes: evolved,
    conservedWater: hydro.conserved,
    conservedCarbon: soil.conserved,
    cloudMoved: weather.moved,
    shaderSeason: false as const,
  }
}
