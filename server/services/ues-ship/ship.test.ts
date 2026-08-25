import { describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { UesShipCore } from './core.js'

describe('UES first-generation ship gates', () => {
  it('fails an empty project and passes a project with verified honest pipelines', () => {
    const store = new SQLiteStore(':memory:')
    const artifacts = new ArtifactGraphService(store)
    const project = store.createProject('u', 'Ship', '')
    const empty = new UesShipCore(store).evaluate('u', project.id)
    expect(empty.ready).toBe(false)
    expect(empty.instantAaa).toBe(false)
    const file = store.createFile({
      id: 'f1', userId: 'u', projectId: project.id, name: 'adv.json', mimeType: 'application/json',
      size: 8, checksum: 'aa', storagePath: '/tmp/a', createdAt: new Date().toISOString(),
    })
    const file2 = store.createFile({
      id: 'f2', userId: 'u', projectId: project.id, name: 'emu.json', mimeType: 'application/json',
      size: 8, checksum: 'bb', storagePath: '/tmp/b', createdAt: new Date().toISOString(),
    })
    artifacts.register('u', {
      projectId: project.id, fileId: file.id, type: 'production.ues-advanced', producer: 'ues.advanced',
      verification: { valid: true, nasa: false, vision: false, storedBitmap16k: false }, metadata: {}, license: 'Apache-2.0',
    })
    artifacts.register('u', {
      projectId: project.id, fileId: file2.id, type: 'production.ues-emulation', producer: 'ues.emulation',
      verification: { valid: true, nasa: false, vision: false, storedBitmap16k: false }, metadata: {}, license: 'Apache-2.0',
    })
    const ready = new UesShipCore(store).evaluate('u', project.id)
    expect(ready.ready).toBe(true)
    expect(ready.verification.valid).toBe(true)
    store.close()
  })
})
