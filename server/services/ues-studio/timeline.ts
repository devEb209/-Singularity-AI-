import type { StudioKey, StudioTrack } from './types.js'

export const sampleKeys = (keys: StudioKey[], t: number) => {
  if (!keys.length) return 0
  const ordered = [...keys].sort((a, b) => a.t - b.t)
  if (t <= ordered[0].t) return ordered[0].value
  if (t >= ordered[ordered.length - 1].t) return ordered[ordered.length - 1].value
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i]
    const b = ordered[i + 1]
    if (t >= a.t && t <= b.t) {
      const u = (t - a.t) / Math.max(1e-9, b.t - a.t)
      return a.value + (b.value - a.value) * u
    }
  }
  return ordered[ordered.length - 1].value
}

export const sampleTracks = (tracks: StudioTrack[], t: number) =>
  Object.fromEntries(tracks.map(track => [`${track.nodeId}.${track.channel}`, sampleKeys(track.keys, t)]))

export const seedTracks = (): StudioTrack[] => [
  { nodeId: 'hero', channel: 'tx', keys: [{ t: 0, value: 1 }, { t: 1, value: 3 }] },
  { nodeId: 'hand', channel: 'ry', keys: [{ t: 0, value: 0 }, { t: 0.5, value: 0.4 }, { t: 1, value: 0 }] },
]
