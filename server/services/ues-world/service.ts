import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { UesWorldCore } from './core.js'
import { streamChunks } from './streaming.js'

export class UesWorldService {
  private core = new UesWorldCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  capabilities() {
    return {
      owner: 'UES',
      status: 'operational-semantic-world-cpu',
      systems: { terrain: 'heightfield+biome+slope', roads: 'A* settlement graph', settlements: 'lots+buildings', vegetation: 'biome instances', streaming: 'chunk resident set' },
      limitations: ['Not GIS import', 'Not photoreal cities', 'CPU reference scale'],
    }
  }

  async build(userId: string, input: { projectId: string; name: string; seed: string; size?: number; viewer?: [number, number] }) {
    this.store.getProject(input.projectId, userId)
    const world = this.core.generate(input.seed, input.size ?? 32, input.viewer ?? [8, 8])
    return this.persist(userId, input.projectId, input.name, 'world.ues-semantic', world, world.verification)
  }

  stream(size: number, viewer: [number, number], radius: number, previous: string[] = []) {
    return streamChunks(size, 8, viewer, radius, previous)
  }

  private async persist(userId: string, projectId: string, name: string, type: string, payload: unknown, verification: { valid: boolean }) {
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${name.replace(/[^a-zA-Z0-9._-]/g, '_')}-world.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-world+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId, fileId: file.id, type, producer: 'ues.semantic-world',
      verification: { ...verification, photorealismClaim: false },
      metadata: { internal: true },
      license: 'Apache-2.0',
    })
    return { world: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
