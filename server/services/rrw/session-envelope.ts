import { persistRealityGraph, loadRealityGraph } from './persist-graph.js'
import type { RealitySession } from './session.js'

export const wrapSession = (session: RealitySession) => {
  const graph = persistRealityGraph(session.nodes, session.relations)
  const envelope = JSON.stringify({
    format: 'rrw-session-v1',
    prompt: session.prompt,
    clock: session.clock,
    climateBase: session.climateBase,
    oceanExtent: session.oceanExtent,
    oceanPressure: session.oceanPressure,
    lineage: session.lineage,
    graph: graph.payload,
    meshStore: false,
  })
  return {
    envelope,
    checksum: graph.checksum,
    bytes: envelope.length,
    meshStore: false as const,
  }
}

export const unwrapSession = (envelope: string): RealitySession => {
  const parsed = JSON.parse(envelope) as {
    prompt: string
    clock: RealitySession['clock']
    climateBase: Record<string, number>
    oceanExtent: RealitySession['oceanExtent']
    oceanPressure: number
    lineage: string[]
    graph: string
  }
  const loaded = loadRealityGraph(parsed.graph)
  const graph = persistRealityGraph(loaded.nodes, loaded.relations)
  return {
    prompt: parsed.prompt,
    nodes: loaded.nodes,
    relations: loaded.relations,
    climateBase: parsed.climateBase,
    oceanExtent: parsed.oceanExtent,
    oceanPressure: parsed.oceanPressure,
    clock: parsed.clock,
    checksum: graph.checksum,
    payload: graph.payload,
    lineage: parsed.lineage,
  }
}
