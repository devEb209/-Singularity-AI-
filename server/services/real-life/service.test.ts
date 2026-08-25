import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { RealLifeService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('Real-Life service artifacts', () => {
  it('persists a verified non-graphics-only reality model', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'reallife-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'City', '')
    const service = new RealLifeService(store, new ArtifactGraphService(store), join(dir, 'uploads'))
    expect(service.catalog().closedModuleList).toBe(false)
    const result = await service.compose('u', {
      projectId: project.id,
      name: 'market',
      objective: 'Simular mercado e clima de uma cidade costeira',
      mode: 'fantasy',
      hardware: 'low',
      phenomenon: 'tempestade e escassez',
    })
    expect(result.artifact.status).toBe('verified')
    expect(result.artifact.type).toBe('model.real-life-universal')
    expect(result.composition.mode).toBe('fantasy')
    expect(result.composition.physics.laws.magicSlots.length).toBeGreaterThan(0)
    store.close()
  })
})
