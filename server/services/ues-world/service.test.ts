import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesWorldService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES world service', () => {
  it('persists a verified semantic world artifact', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'world-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'Land', '')
    const service = new UesWorldService(store, new ArtifactGraphService(store), join(dir, 'uploads'))
    const result = await service.build('u', { projectId: project.id, name: 'coast', seed: 'harbor' })
    expect(result.artifact.status).toBe('verified')
    expect(result.artifact.type).toBe('world.ues-semantic')
    store.close()
  })
})
