import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesCraftService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES craft pipeline', () => {
  it('persists a verified craft artifact joining retopo, anatomy, net and image', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'craft-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'Hero', '')
    const result = await new UesCraftService(store, new ArtifactGraphService(store), join(dir, 'uploads')).build('u', { projectId: project.id, name: 'hero', prompt: 'humano' })
    expect(result.artifact.status).toBe('verified')
    expect(result.result.verification.webrtc).toBe(false)
    expect(result.result.verification.learnedSr).toBe(false)
    store.close()
  })
})
