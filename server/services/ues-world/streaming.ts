import type { StreamView } from './types.js'

export const chunkId = (cx: number, cz: number) => `c${cx}:${cz}`

export const allChunks = (size: number, chunkSize: number) => {
  const count = Math.ceil(size / chunkSize)
  const ids: string[] = []
  for (let z = 0; z < count; z++) for (let x = 0; x < count; x++) ids.push(chunkId(x, z))
  return ids
}

export const streamChunks = (size: number, chunkSize: number, viewer: [number, number], radius: number, previous: string[] = []): StreamView => {
  const count = Math.ceil(size / chunkSize)
  const loaded: string[] = []
  for (let z = 0; z < count; z++) {
    for (let x = 0; x < count; x++) {
      const centerX = x * chunkSize + chunkSize / 2
      const centerZ = z * chunkSize + chunkSize / 2
      if (Math.hypot(centerX - viewer[0], centerZ - viewer[1]) <= radius + chunkSize / 2) loaded.push(chunkId(x, z))
    }
  }
  const previousSet = new Set(previous)
  const nextSet = new Set(loaded)
  return {
    viewer,
    radius,
    chunkSize,
    loaded: loaded.filter(id => !previousSet.has(id)),
    unloaded: previous.filter(id => !nextSet.has(id)),
    resident: loaded,
  }
}
