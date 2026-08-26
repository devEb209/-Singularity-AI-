import { presentLive } from './present-live.js'
import { recallWorld } from './remember-world.js'
import type { WorldStore } from './world-store.js'

export const presentStored = (store: WorldStore, worldId: string) => {
  const session = recallWorld(store, worldId)
  if (!session) {
    return { sameIds: false, packets: 0, hasChronicle: false, framebufferFoundation: false, meshIsFoundation: false, found: false as const }
  }
  return { ...presentLive(session.nodes), found: true as const }
}
