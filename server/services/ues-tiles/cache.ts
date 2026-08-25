export interface CachedTile {
  id: string
  uri?: string
  lastAccess: number
  bytes: number
}

export class TileCache {
  private items = new Map<string, CachedTile>()
  constructor(private budget = 12) {}

  touch(id: string, uri: string | undefined, bytes = 1, now = Date.now()) {
    this.items.set(id, { id, uri, lastAccess: now, bytes })
    return this.evict()
  }

  evict() {
    const evicted: string[] = []
    if (this.items.size <= this.budget) return evicted
    const ranked = [...this.items.values()].sort((a, b) => a.lastAccess - b.lastAccess)
    while (this.items.size > this.budget) {
      const oldest = ranked.shift()
      if (!oldest) break
      this.items.delete(oldest.id)
      evicted.push(oldest.id)
    }
    return evicted
  }

  unload(ids: string[]) {
    for (const id of ids) this.items.delete(id)
  }

  has(id: string) {
    return this.items.has(id)
  }

  size() {
    return this.items.size
  }

  snapshot() {
    return [...this.items.values()].map(item => ({ id: item.id, uri: item.uri }))
  }
}
