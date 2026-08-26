import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const safeId = (id: string) => id.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64)

export class WorldStore {
  private mem = new Map<string, string>()

  constructor(private dir?: string) {
    if (dir) mkdirSync(dir, { recursive: true })
  }

  get persistent() {
    return Boolean(this.dir)
  }

  put(id: string, envelope: string) {
    this.mem.set(id, envelope)
    if (this.dir) writeFileSync(join(this.dir, `${safeId(id)}.json`), envelope, 'utf8')
    return { id, bytes: envelope.length, persistent: this.persistent, meshStore: false as const }
  }

  get(id: string) {
    const hit = this.mem.get(id)
    if (hit) return hit
    if (!this.dir) return null
    const path = join(this.dir, `${safeId(id)}.json`)
    if (!existsSync(path)) return null
    const envelope = readFileSync(path, 'utf8')
    this.mem.set(id, envelope)
    return envelope
  }

  clearMem() {
    this.mem.clear()
  }
}
