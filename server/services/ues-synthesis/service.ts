import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { UesSynthesisCore } from './core.js'
import type { WorldKind } from './recipe.js'

export class UesSynthesisService {
  private core = new UesSynthesisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async synthesize(userId: string, input: { projectId: string; name: string; seed?: string; kind?: WorldKind; seaLevel?: number }) {
    this.store.getProject(input.projectId, userId)
    const payload = this.core.synthesize({
      kind: input.kind ?? 'fantasy',
      seed: input.seed ?? 'earth-like',
      mutations: [{ field: 'seaLevel', delta: input.seaLevel ?? 0.12 }],
    })
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-synthesis.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-synthesis+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'world.ues-synthesis', producer: 'ues.synthesis',
      verification: payload.verification,
      metadata: { kind: payload.kind, magic: false },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
