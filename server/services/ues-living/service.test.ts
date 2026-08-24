import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesLivingWorldService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES living world', () => {
  it('builds a verified multi-system living world artifact', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'live-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'City', '')
    const service = new UesLivingWorldService(store, new ArtifactGraphService(store), join(dir, 'uploads'))
    const result = await service.build('u', { projectId: project.id, name: 'harbor', seed: 'harbor-delta' })
    expect(result.artifact.status).toBe('verified')
    expect(result.result.verification.gpu).toBe(false)
    expect(result.result.world.settlements).toBeGreaterThan(0)
    expect(result.result.society.sampleSize).toBe(24)
    store.close()
  })
})
