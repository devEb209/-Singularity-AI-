import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { NmnCharacter } from './types.js'

export interface NmnState {
  characters: NmnCharacter[]
  files: Record<string, unknown>
}

const empty = (): NmnState => ({ characters: [], files: {} })

export const characterFiles = (character: NmnCharacter) => {
  const root = `NPC/${character.id}`
  return {
    [`${root}/Identity.json`]: character.identity,
    [`${root}/Personality.json`]: character.personality,
    [`${root}/Knowledge.json`]: character.knowledge,
    [`${root}/Memories/index.json`]: character.memory.map(item => ({ id: item.id, layer: item.layer, impact: item.impact })),
    [`${root}/Relationships.json`]: character.relationships,
    [`${root}/Experiences.json`]: character.history,
    [`${root}/Goals.json`]: character.goals,
    [`${root}/History.json`]: character.causal,
    [`${root}/CurrentState.json`]: {
      location: character.location,
      needs: character.needs,
      lastAction: character.lastAction,
      lastReason: character.lastReason,
      fidelity: character.fidelity,
      tick: character.tick,
    },
    [`${root}/ImportantEvents.json`]: character.memory.filter(item => item.layer === 'important'),
  }
}

export class NmnStateStore {
  private locks = new Map<string, Promise<unknown>>()
  constructor(private root = resolve('./data/nmn')) {}
  private path(userId: string) {
    return join(this.root, `${createHash('sha256').update(userId).digest('hex')}.json`)
  }
  async read(userId: string): Promise<NmnState> {
    try {
      return JSON.parse(await readFile(this.path(userId), 'utf8')) as NmnState
    } catch {
      return empty()
    }
  }
  async update<T>(userId: string, mutate: (state: NmnState) => T | Promise<T>) {
    const previous = this.locks.get(userId) ?? Promise.resolve()
    const next = previous.catch(() => undefined).then(async () => {
      const state = await this.read(userId)
      const result = await mutate(state)
      const path = this.path(userId)
      const temporary = `${path}.${process.pid}.${Date.now()}.tmp`
      await mkdir(this.root, { recursive: true })
      await writeFile(temporary, JSON.stringify(state, null, 2), { flag: 'wx' })
      await rename(temporary, path)
      return result
    })
    this.locks.set(userId, next)
    try {
      return await next as T
    } finally {
      if (this.locks.get(userId) === next) this.locks.delete(userId)
    }
  }
}
