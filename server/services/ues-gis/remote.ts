import { evaluateSource } from './policy.js'
import { sourceById } from './sources.js'
import type { GisCredentials } from './types.js'

export const probeRemote = (sourceId: string, credentials?: GisCredentials) => {
  const source = sourceById(sourceId)
  const policy = evaluateSource(sourceId, credentials)
  return {
    format: 'ues-gis-remote-probe-v1' as const,
    sourceId,
    family: source?.family ?? 'unknown',
    homepage: source?.homepage,
    auth: source?.auth ?? 'none',
    vendorLock: false as const,
    nasa: sourceId === 'nasa-earthdata' ? 'adapter-available-not-integrated' : false,
    google: sourceId === 'google-photorealistic' ? 'adapter-available-not-integrated' : false,
    cesium: sourceId === 'cesium-native' ? 'adapter-available-not-integrated' : false,
    ...policy,
    fetchedRemote: false as const,
    liveRemote: false as const,
  }
}
