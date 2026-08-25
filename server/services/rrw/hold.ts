import { composeReality } from './compose.js'
import { persistRealityGraph, restoreRealityGraph } from './persist-graph.js'
import { evolveDays } from './days.js'

export const holdWorld = (prompt: string) => {
  const composed = composeReality(prompt)
  const frozen = persistRealityGraph(composed.nodes, composed.relations)
  const restored = restoreRealityGraph(frozen.payload)
  const again = persistRealityGraph(composed.nodes, composed.relations)
  const evolved = evolveDays(prompt, 2)
  return {
    biome: composed.intent.biome,
    checksum: frozen.checksum,
    restored: restored.nodes === composed.nodes.length,
    stable: frozen.checksum === again.checksum,
    evolved: evolved.fireCooled,
    oceanPhase: evolved.oceanPhase,
    meshStore: frozen.meshStore,
    assetStore: frozen.assetStore,
    eraseHistory: false as const,
  }
}
