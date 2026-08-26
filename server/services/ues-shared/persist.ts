import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'

export const persistUesArtifact = async <T extends { verification: Record<string, unknown> }>(
  store: Store,
  artifacts: ArtifactGraphService,
  root: string,
  userId: string,
  input: { projectId: string; name: string },
  payload: T,
  spec: { suffix: string; mime: string; type: string; producer: string; metadata: Record<string, unknown> },
) => {
  store.getProject(input.projectId, userId)
  const bytes = Buffer.from(JSON.stringify(payload, null, 2))
  const directory = join(root, userId)
  await mkdir(directory, { recursive: true })
  const fileId = id('file')
  const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-${spec.suffix}`
  const storagePath = join(directory, `${fileId}-${safe}`)
  await writeFile(storagePath, bytes, { flag: 'wx' })
  const file: FileAsset = {
    id: fileId,
    userId,
    projectId: input.projectId,
    name: safe,
    mimeType: spec.mime,
    size: bytes.length,
    checksum: createHash('sha256').update(bytes).digest('hex'),
    storagePath,
    createdAt: now(),
  }
  store.createFile(file)
  const artifact = artifacts.register(userId, {
    projectId: input.projectId,
    fileId: file.id,
    type: spec.type,
    producer: spec.producer,
    verification: payload.verification,
    metadata: spec.metadata,
    license: 'Apache-2.0',
  })
  return { result: payload, file: { ...file, storagePath: undefined }, artifact }
}
