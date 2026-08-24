import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesForgeService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES forge pipeline', () => {
  it('persists a verified forge artifact without claiming GPU, vision or GIS', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'forge-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'Forge', '')
    const result = await new UesForgeService(store, new ArtifactGraphService(store), join(dir, 'uploads')).build('u', { projectId: project.id, name: 'forge', prompt: 'personagem humano' })
    expect(result.artifact.status).toBe('verified')
    expect(result.result.verification.gpu).toBe(false)
    expect(result.result.verification.vision).toBe(false)
    expect(result.result.verification.gis).toBe(false)
    expect(result.result.corpus.count).toBe(9)
    store.close()
  })
})
