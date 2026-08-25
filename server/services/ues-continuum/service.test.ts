import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesContinuumService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES continuum pipeline', () => {
  it('persists a verified continuum artifact without claiming GPU, vision or WebRTC', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cont-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'Harbor', '')
    const result = await new UesContinuumService(store, new ArtifactGraphService(store), join(dir, 'uploads')).build('u', { projectId: project.id, name: 'harbor', prompt: 'humano na cidade', seed: 'harbor-delta' })
    expect(result.artifact.status).toBe('verified')
    expect(result.result.verification.gpu).toBe(false)
    expect(result.result.verification.vision).toBe(false)
    expect(result.result.verification.webrtc).toBe(false)
    expect(result.result.city.sampleSize).toBe(96)
    store.close()
  })
})
