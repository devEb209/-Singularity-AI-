import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesEmulationService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES world emulation pipeline', () => {
  it('persists a verified emulation artifact without NASA, vision or 16K bitmaps', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'emu-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'Earth', '')
    const result = await new UesEmulationService(store, new ArtifactGraphService(store), join(dir, 'uploads')).build('u', { projectId: project.id, name: 'earth', prompt: 'terra habitavel' })
    expect(result.artifact.status).toBe('verified')
    expect(result.result.verification.nasa).toBe(false)
    expect(result.result.verification.vision).toBe(false)
    expect(result.result.verification.storedBitmap16k).toBe(false)
    expect(result.result.creation.instantAaa).toBe(false)
    store.close()
  })
})
