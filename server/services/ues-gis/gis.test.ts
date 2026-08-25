import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesGisCore } from './core.js'
import { fixtureLayers } from './fixture.js'
import { probeRemote } from './remote.js'
import { UesGisService } from './service.js'
import { gisSources } from './sources.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('UES GIS adapters', () => {
  it('operates the internal fixture and refuses to pretend NASA is live', () => {
    const layers = fixtureLayers()
    expect(layers).toHaveLength(5)
    expect(layers.every(item => item.fetchedRemote === false)).toBe(true)
    expect(new Set(layers.map(item => item.kind)).size).toBe(5)
    const internal = new UesGisCore().ingest('internal-fixture')
    expect(internal.verification.valid).toBe(true)
    expect(internal.verification.liveRemote).toBe(false)
    expect(internal.nasa).toBe(false)
    const nasa = probeRemote('nasa-earthdata')
    expect(nasa.fetchedRemote).toBe(false)
    expect(nasa.status).toBe('ADAPTER_AVAILABLE')
    expect(gisSources.every(item => item.vendorLock === false)).toBe(true)
    const google = new UesGisCore().ingest('google-photorealistic')
    expect(google.verification.valid).toBe(false)
    expect(google.fields).toHaveLength(0)
  })

  it('persists a verified internal ingest artifact', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'gis-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'Gis', '')
    const result = await new UesGisService(store, new ArtifactGraphService(store), join(dir, 'uploads')).ingest('u', {
      projectId: project.id,
      name: 'sample',
    })
    expect(result.artifact.status).toBe('verified')
    expect(result.result.nasa).toBe(false)
    store.close()
  })
})
