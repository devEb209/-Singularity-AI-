import { answerWorld } from './query-world.js'
import { recallWorld } from './remember-world.js'
import type { WorldStore } from './world-store.js'

export const queryStored = (store: WorldStore, worldId: string, question: string) => {
  const session = recallWorld(store, worldId)
  if (!session) return { kind: 'unknown' as const, id: null, found: false, meshQuery: false as const }
  return { ...answerWorld(session.nodes, question), meshQuery: false as const }
}
