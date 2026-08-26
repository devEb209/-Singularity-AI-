import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { AutonomyService, AutonomyStateStore } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('Autonomy service', () => {
  it('creates, ticks, pauses and records a verified autonomy artifact', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'auto-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'Doc', '')
    const service = new AutonomyService(store, new ArtifactGraphService(store), join(dir, 'uploads'), new AutonomyStateStore(join(dir, 'state')))
    const created = await service.create('u', { projectId: project.id, name: 'docs', intent: 'Criar um editor colaborativo obrigatório' })
    expect(created.artifact.status).toBe('verified')
    const autonomyId = created.evaluation.project.id
    const ticked = await service.tick('u', autonomyId)
    expect(ticked.evaluation.project.cycle).toBeGreaterThan(0)
    const paused = await service.control('u', autonomyId, 'pause')
    expect(paused.evaluation.project.stage).toBe('paused')
    store.close()
  })
})
