import { cloneNodes } from './extent.js'
import { composeReality } from './compose.js'
import { advanceHour } from './advance.js'
import { advanceClock, referenceClock, type RealityClock } from './orbit.js'
import { loadRealityGraph, persistRealityGraph } from './persist-graph.js'
import { climateBaseOf } from './season.js'
import type { RealityExtent, RealityNode, RealityRelation } from './types.js'

export interface RealitySession {
  prompt: string
  nodes: RealityNode[]
  relations: RealityRelation[]
  climateBase: Record<string, number>
  oceanExtent: RealityExtent
  oceanPressure: number
  clock: RealityClock
  checksum: string
  payload: string
  lineage: string[]
}

const copyExtent = (extent: RealityExtent): RealityExtent => ({
  ...extent,
  center: extent.center ? [extent.center[0], extent.center[1], extent.center[2]] : undefined,
  min: extent.min ? [extent.min[0], extent.min[1], extent.min[2]] : undefined,
  max: extent.max ? [extent.max[0], extent.max[1], extent.max[2]] : undefined,
  of: extent.of ? [...extent.of] : undefined,
})

export const openSession = (prompt = 'oceano salgado com fogo, floresta e um humano'): RealitySession => {
  const composed = composeReality(prompt)
  const ocean = composed.nodes.find(item => item.id === 'ocean')!
  const frozen = persistRealityGraph(composed.nodes, composed.relations)
  return {
    prompt,
    nodes: composed.nodes,
    relations: composed.relations,
    climateBase: climateBaseOf(composed.nodes),
    oceanExtent: copyExtent(ocean.extent),
    oceanPressure: ocean.pressurePa,
    clock: referenceClock(12, 100, 0.25),
    checksum: frozen.checksum,
    payload: frozen.payload,
    lineage: [frozen.checksum],
  }
}

export const tickSession = (session: RealitySession, hours = 4): RealitySession => {
  let nodes = cloneNodes(session.nodes)
  let clock = session.clock
  for (let i = 0; i < hours; i++) {
    clock = advanceClock(clock, 1)
    const advanced = advanceHour(nodes, session.climateBase, session.oceanExtent, session.oceanPressure, clock)
    nodes = advanced.nodes
  }
  const frozen = persistRealityGraph(nodes, session.relations)
  return {
    ...session,
    nodes,
    clock,
    checksum: frozen.checksum,
    payload: frozen.payload,
    lineage: [...session.lineage, frozen.checksum],
  }
}

export const resumeSession = (session: RealitySession, hours = 3) => {
  const loaded = loadRealityGraph(session.payload)
  const continued = tickSession({ ...session, nodes: loaded.nodes, relations: loaded.relations }, hours)
  const fireBefore = session.nodes.find(item => item.id === 'fire')!.temperatureK
  const fireAfter = continued.nodes.find(item => item.id === 'fire')!.temperatureK
  return {
    session: continued,
    thawed: loaded.nodes.length === session.nodes.length,
    resumed: fireAfter < fireBefore,
    fireBefore,
    fireAfter,
    sameIds: loaded.nodes.map(item => item.id).sort().join(',') === session.nodes.map(item => item.id).sort().join(','),
    recomposed: false as const,
    meshStore: false as const,
  }
}

export const holdAndResume = (prompt = 'oceano salgado com fogo') => {
  const opened = openSession(prompt)
  const ticked = tickSession(opened, 4)
  return resumeSession(ticked, 3)
}
