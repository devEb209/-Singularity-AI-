import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runPersist } from './persist-run.js'
import { WorldStore } from './world-store.js'

const prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

describe('RRW persist', () => {
  it('saves, lives and reloads the same world without closing Genesis', () => {
    const store = new WorldStore()
    const first = runPersist(prompt, 3, store)
    expect(first.created).toBe(true)
    expect(first.fireCooled).toBe(true)
    expect(first.sameIds).toBe(true)
    expect(first.shelterSurvived).toBe(true)
    expect(first.lineageGrew).toBe(true)
    expect(first.reloaded).toBe(true)
    expect(first.queried.found).toBe(true)
    expect(first.share.owner).toBe(true)
    expect(first.share.peer).toBe(true)
    expect(first.share.stranger).toBe(false)
    expect(first.verification.valid).toBe(true)
    expect(first.verification.genesisClosed).toBe(false)
    expect(first.verification.completeReality).toBe(false)
    const second = runPersist(prompt, 3, store)
    expect(second.created).toBe(false)
    expect(second.fireAfter).toBeLessThan(first.fireAfter)
    expect(second.verification.valid).toBe(true)
  })

  it('reloads from a JSON file after memory is wiped', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rrw-persist-'))
    try {
      const store = new WorldStore(dir)
      const first = runPersist(prompt, 3, store)
      expect(first.persistent).toBe(true)
      expect(first.verification.valid).toBe(true)
      store.clearMem()
      const second = runPersist(prompt, 2, store)
      expect(second.created).toBe(false)
      expect(second.fireAfter).toBeLessThan(first.fireAfter)
      expect(second.verification.meshStore).toBe(false)
      expect(second.verification.databaseDistributed).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
