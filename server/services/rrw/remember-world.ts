import { unwrapSession, wrapSession } from './session-envelope.js'
import type { RealitySession } from './session.js'
import { worldIdOf } from './world-id.js'
import type { WorldStore } from './world-store.js'

export const rememberWorld = (store: WorldStore, session: RealitySession, id?: string) => {
  const worldId = id ?? worldIdOf(session.prompt)
  const wrapped = wrapSession(session)
  store.put(worldId, wrapped.envelope)
  return {
    worldId,
    checksum: wrapped.checksum,
    bytes: wrapped.bytes,
    meshStore: false as const,
    databaseDistributed: false as const,
  }
}

export const recallWorld = (store: WorldStore, worldId: string): RealitySession | null => {
  const envelope = store.get(worldId)
  if (!envelope) return null
  return unwrapSession(envelope)
}
