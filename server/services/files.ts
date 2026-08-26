import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type { MultipartFile } from '@fastify/multipart'
import type { Store } from '../repositories/store.js'
import type { FileAsset } from '../domain.js'
import { AppError } from '../lib/errors.js'
import { id, now } from '../lib/id.js'

const allowed = new Set(['text/plain','text/markdown','application/json','application/pdf','image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','video/mp4','model/gltf-binary','application/octet-stream','application/zip'])

export class FileService {
  constructor(private store: Store, private root: string, private maxBytes: number) {}
  async upload(userId: string, part: MultipartFile, projectId?: string) {
    if (!allowed.has(part.mimetype)) throw new AppError('Tipo de arquivo não permitido.', 415, 'UNSUPPORTED_FILE_TYPE')
    const buffer = await part.toBuffer()
    if (buffer.length > this.maxBytes) throw new AppError('Arquivo excede o limite configurado.', 413, 'FILE_TOO_LARGE')
    const fileId = id('file'); const safeName = basename(part.filename).replace(/[^\p{L}\p{N}._-]/gu, '_').slice(0, 180) || 'arquivo'
    const directory = join(this.root, userId); const storagePath = join(directory, `${fileId}-${safeName}`)
    await mkdir(directory, { recursive: true }); await writeFile(storagePath, buffer, { flag: 'wx' })
    const file: FileAsset = { id: fileId, userId, projectId, name: safeName, mimeType: part.mimetype, size: buffer.length, checksum: createHash('sha256').update(buffer).digest('hex'), storagePath, createdAt: now() }
    this.store.createFile(file); this.store.audit({ id: id('audit'), userId, action: 'file.upload', resource: file.id, metadata: { name: safeName, size: buffer.length }, createdAt: now() })
    return { ...file, storagePath: undefined }
  }
  list(userId: string, projectId?: string) { return this.store.listFiles(userId, projectId).map(({ storagePath: _, ...file }) => file) }
  get(userId: string, fileId: string) { return this.store.getFile(fileId, userId) }
  async delete(userId: string, fileId: string) { const file = this.store.deleteFile(fileId, userId); await rm(file.storagePath, { force: true }); this.store.audit({ id: id('audit'), userId, action: 'file.delete', resource: fileId, createdAt: now() }) }
}
