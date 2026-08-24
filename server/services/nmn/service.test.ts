import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { NmnService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('NMN service', () => {
  it('persists a war scenario with distinct contextual actions and file-manager paths', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'nmn-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'City', '')
    const service = new NmnService(store, new ArtifactGraphService(store), join(dir, 'uploads'), new (await import('./persist.js')).NmnStateStore(join(dir, 'state')))
    expect(service.capabilities().consciousnessClaim).toBe(false)
    expect(service.capabilities().voice).toBe('adapter-required')
    const result = await service.war('u', { projectId: project.id, name: 'invasion' })
    expect(result.artifact.status).toBe('verified')
    const invasion = (result.result as { invasionPass: { distinctActions: string[]; files: string[]; characters: { name: string; action: string }[] } }).invasionPass
    expect(invasion.distinctActions.length).toBeGreaterThanOrEqual(5)
    expect(invasion.files.some(path => path.startsWith('NPC/npc-c/'))).toBe(true)
    expect(invasion.characters.find(item => item.name === 'Célia')?.action).toBe('aid-wounded')
    store.close()
  })
})
