import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesNavService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES nav service', () => {
  it('persists a navigation bundle', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'nav-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'City', '')
    const result = await new UesNavService(store, new ArtifactGraphService(store), join(dir, 'uploads')).compile('u', { projectId: project.id, name: 'paths', seed: 'harbor', action: 'aid-wounded' })
    expect(result.artifact.status).toBe('verified')
    store.close()
  })
})
