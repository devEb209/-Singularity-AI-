import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesRealisCore } from './core.js'
import { UesRealisService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES Realis chain', () => {
  it('runs the internal chain and keeps NASA/vision/16K honest', () => {
    const result = new UesRealisCore().process('granito molhado em terra alternativa')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.nasa).toBe(false)
    expect(result.verification.vision).toBe(false)
    expect(result.verification.storedBitmap16k).toBe(false)
    expect(result.verification.cesiumRequired).toBe(false)
    expect(result.remoteNasa.valid).toBe(false)
    expect(result.creation.instantAaa).toBe(false)
    expect(result.titko.wetness).toBeGreaterThan(0)
  })

  it('persists a verified realis artifact', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'realis-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'Realis', '')
    const result = await new UesRealisService(store, new ArtifactGraphService(store), join(dir, 'uploads')).build('u', {
      projectId: project.id,
      name: 'realis',
      prompt: 'continente ficticio com granito molhado',
    })
    expect(result.artifact.status).toBe('verified')
    expect(result.result.gis.nasa).toBe(false)
    store.close()
  })
})
