import { advanceHour } from './advance.js'
import { applyRefine } from './apply-refine.js'
import { remember } from './chronicle.js'
import { placeTag } from './event-place.js'
import { reactLiving } from './react-living.js'
import { stepWeathering } from './weathering.js'
import { waterMoles } from './exchange.js'
import type { RealityClock } from './orbit.js'
import type { RealityExtent, RealityNode } from './types.js'

export const liveHour = (
  nodes: RealityNode[],
  climateBase: Record<string, number>,
  oceanExtent: RealityExtent,
  oceanPressure: number,
  clock: RealityClock,
) => {
  const advanced = advanceHour(nodes, climateBase, oceanExtent, oceanPressure, clock)
  const weathered = stepWeathering(advanced.nodes)
  const reacted = reactLiving(weathered.nodes)
  const refined = applyRefine(reacted.nodes)
  const fire = refined.nodes.find(item => item.id === 'fire')
  const human = refined.nodes.find(item => item.id === 'human')
  const tagged = human ? placeTag(human) : 'at=0,0,0'
  const recorded = remember(
    refined.nodes,
    `hour=${clock.hour} day=${clock.dayOfYear} action=${reacted.action} fire=${(fire?.temperatureK ?? 0).toFixed(2)} water=${waterMoles(refined.nodes).toFixed(3)} ${tagged}`,
  )
  return {
    nodes: recorded.nodes,
    conservedWater: advanced.conservedWater,
    conservedRock: weathered.conserved,
    action: reacted.action,
    settled: refined.after === 0,
    shaderSeason: false as const,
  }
}
