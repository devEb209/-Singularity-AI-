import { persistRealityGraph } from './persist-graph.js'
import type { RealityNode, RealityRelation } from './types.js'

export const recordHistory = (steps: { nodes: RealityNode[]; relations: RealityRelation[]; note: string }[]) => {
  const versions = steps.map((step, index) => {
    const frozen = persistRealityGraph(step.nodes, step.relations)
    return {
      index,
      note: step.note,
      checksum: frozen.checksum,
      nodes: step.nodes.length,
      meshStore: frozen.meshStore,
    }
  })
  const unique = new Set(versions.map(item => item.checksum)).size
  return {
    versions,
    unique,
    lineagePreserved: versions.length === steps.length,
    eraseHistory: false as const,
    meshStore: false as const,
  }
}
