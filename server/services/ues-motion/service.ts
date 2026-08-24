import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { stride } from './locomotion.js'

export class UesMotionService {
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string }) {
    this.store.getProject(input.projectId, userId)
    const result = stride()
    const bytes = Buffer.from(JSON.stringify(result, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-motion.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-motion+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'animation.ues-locomotion', producer: 'ues.motion',
      verification: result.verification,
      metadata: { frames: result.frames.length },
      license: 'Apache-2.0',
    })
    return { result, file: { ...file, storagePath: undefined }, artifact }
  }
}
