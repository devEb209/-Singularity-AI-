import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { UesPlanetCore } from './core.js'

export class UesPlanetService {
  private core = new UesPlanetCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async generate(userId: string, input: { projectId: string; name: string; seed?: string }) {
    this.store.getProject(input.projectId, userId)
    const generated = this.core.generate(input.seed ?? 'earth-like')
    const payload = { ...generated, grid: { rivers: generated.grid.riverMask.flat().filter(Boolean).length } }
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-planet.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-planet+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'world.ues-planet', producer: 'ues.planet',
      verification: payload.verification,
      metadata: { land: payload.land, ocean: payload.ocean, nasa: false },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
