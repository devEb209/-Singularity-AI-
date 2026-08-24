import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { defaultRepresentations } from '../real-life/optimize.js'
import { optimizeLoop } from './loop.js'

export class UesOptimizeService {
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async run(userId: string, input: { projectId: string; name: string; quality?: number }) {
    this.store.getProject(input.projectId, userId)
    const result = optimizeLoop(defaultRepresentations('real-life'), input.quality ?? 8)
    const bytes = Buffer.from(JSON.stringify(result, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-optimize.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-optimize+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'analysis.ues-optimize', producer: 'ues.optimizer',
      verification: result.verification,
      metadata: { rollback: result.rollback, frontier: result.frontier },
      license: 'Apache-2.0',
    })
    return { result, file: { ...file, storagePath: undefined }, artifact }
  }
}
