import { describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { SnbRollbackCore } from './core.js'

const file = (store: SQLiteStore, userId: string, projectId: string, name: string) =>
  store.createFile({
    id: `file_${name}`,
    userId,
    projectId,
    name: `${name}.json`,
    mimeType: 'application/json',
    size: 12,
    checksum: name.repeat(8).slice(0, 64),
    storagePath: `/tmp/${name}`,
    createdAt: new Date().toISOString(),
  })

describe('SNB artifact regression rollback', () => {
  it('keeps a better candidate and rolls a worse one back to the verified parent', () => {
    const store = new SQLiteStore(':memory:')
    const artifacts = new ArtifactGraphService(store)
    const project = store.createProject('u', 'Rollback', '')
    const a = file(store, 'u', project.id, 'base')
    const b = file(store, 'u', project.id, 'worse')
    const c = file(store, 'u', project.id, 'better')
    const base = artifacts.register('u', {
      projectId: project.id, fileId: a.id, type: 'production.ues-test', producer: 'test',
      verification: { valid: true, gpp: 80 }, metadata: { gpp: 80, quality: 8 }, license: 'Apache-2.0',
    })
    const worse = artifacts.register('u', {
      projectId: project.id, fileId: b.id, type: 'production.ues-test', producer: 'test', parentId: base.id,
      verification: { valid: true, gpp: 40 }, metadata: { gpp: 40, quality: 3 }, license: 'Apache-2.0',
    })
    const core = new SnbRollbackCore(store)
    const rolled = core.evaluate('u', worse.id)
    expect(rolled.decision.action).toBe('rollback')
    expect(rolled.puterInvoked).toBe(false)
    expect(store.getArtifact(worse.id, 'u').status).toBe('rejected')
    expect(store.getArtifact(base.id, 'u').status).toBe('verified')
    const better = artifacts.register('u', {
      projectId: project.id, fileId: c.id, type: 'production.ues-test', producer: 'test', parentId: base.id,
      verification: { valid: true, gpp: 88 }, metadata: { gpp: 88, quality: 9 }, license: 'Apache-2.0',
    })
    const kept = core.evaluate('u', better.id)
    expect(kept.decision.action).toBe('accept')
    expect(store.getArtifact(better.id, 'u').status).toBe('verified')
    store.close()
  })
})
