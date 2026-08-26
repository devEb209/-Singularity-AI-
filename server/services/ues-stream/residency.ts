import { allChunks, chunkId } from '../ues-world/streaming.js'

export interface ResidentState {
  resident: string[]
  loaded: string[]
  unloaded: string[]
  evicted: string[]
}

const centerOf = (id: string, chunkSize: number) => {
  const [, cx, cz] = /c(\d+):(\d+)/.exec(id) ?? ['', '0', '0']
  return [Number(cx) * chunkSize + chunkSize / 2, Number(cz) * chunkSize + chunkSize / 2] as [number, number]
}

export const desired = (size: number, chunkSize: number, viewer: [number, number], radius: number) => {
  const count = Math.ceil(size / chunkSize)
  const ids: string[] = []
  for (let z = 0; z < count; z++) {
    for (let x = 0; x < count; x++) {
      const cx = x * chunkSize + chunkSize / 2
      const cz = z * chunkSize + chunkSize / 2
      if (Math.hypot(cx - viewer[0], cz - viewer[1]) <= radius + chunkSize / 2) ids.push(chunkId(x, z))
    }
  }
  return ids
}

export const tickResidency = (
  previous: string[],
  size: number,
  chunkSize: number,
  viewer: [number, number],
  loadRadius: number,
  unloadRadius: number,
  budget: number,
): ResidentState => {
  const want = new Set(desired(size, chunkSize, viewer, loadRadius))
  const keep = previous.filter(id => {
    const [cx, cz] = centerOf(id, chunkSize)
    return Math.hypot(cx - viewer[0], cz - viewer[1]) <= unloadRadius + chunkSize / 2
  })
  const incoming = [...want].filter(id => !keep.includes(id) && !previous.includes(id))
  let resident = [...new Set([...keep, ...incoming])]
  const evicted: string[] = []
  if (resident.length > budget) {
    resident.sort((a, b) => {
      const [ax, az] = centerOf(a, chunkSize)
      const [bx, bz] = centerOf(b, chunkSize)
      return Math.hypot(bx - viewer[0], bz - viewer[1]) - Math.hypot(ax - viewer[0], az - viewer[1])
    })
    evicted.push(...resident.slice(budget))
    resident = resident.slice(0, budget)
  }
  const prev = new Set(previous)
  const next = new Set(resident)
  return {
    resident,
    loaded: resident.filter(id => !prev.has(id)),
    unloaded: previous.filter(id => !next.has(id)),
    evicted,
  }
}

export const universe = (size: number, chunkSize: number) => allChunks(size, chunkSize)
