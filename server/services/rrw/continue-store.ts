import { cloneNodes } from './extent.js'
import { liveHour } from './live-hour.js'
import { advanceClock } from './orbit.js'
import { persistRealityGraph } from './persist-graph.js'
import { recallWorld, rememberWorld } from './remember-world.js'
import type { RealitySession } from './session.js'
import type { WorldStore } from './world-store.js'

export const continueStored = (store: WorldStore, worldId: string, hours = 3): RealitySession => {
  const session = recallWorld(store, worldId)
  if (!session) throw new Error(`rrw world not found: ${worldId}`)
  let nodes = cloneNodes(session.nodes)
  let clock = session.clock
  for (let i = 0; i < hours; i++) {
    clock = advanceClock(clock, 1)
    const hour = liveHour(nodes, session.climateBase, session.oceanExtent, session.oceanPressure, clock)
    nodes = hour.nodes
  }
  const frozen = persistRealityGraph(nodes, session.relations)
  const next: RealitySession = {
    ...session,
    nodes,
    clock,
    checksum: frozen.checksum,
    payload: frozen.payload,
    lineage: [...session.lineage, frozen.checksum],
  }
  rememberWorld(store, next, worldId)
  return next
}
