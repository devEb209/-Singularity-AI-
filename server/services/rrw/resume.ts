import { cloneNodes } from './extent.js'
import { composeReality } from './compose.js'
import { evolveFrom } from './days.js'
import { persistRealityGraph } from './persist-graph.js'
import { thawNodes } from './snapshot.js'
import { freezeReality } from './snapshot.js'

export const resumeWorld = (prompt = 'oceano salgado com fogo') => {
  const composed = composeReality(prompt)
  const frozen = freezeReality(composed.nodes, composed.relations)
  const thawed = thawNodes(frozen)
  const first = evolveFrom(cloneNodes(thawed), 4)
  const fireA = first.find(item => item.id === 'fire')!.temperatureK
  const held = persistRealityGraph(first, composed.relations)
  const second = evolveFrom(cloneNodes(first), 4)
  const fireB = second.find(item => item.id === 'fire')!.temperatureK
  return {
    thawed: thawed.length === composed.nodes.length,
    resumed: fireB < fireA,
    fireAfterResume: fireB,
    checksum: held.checksum,
    recomposed: false as const,
    meshStore: held.meshStore,
  }
}
