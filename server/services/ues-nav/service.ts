import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { UesWorldCore } from '../ues-world/core.js'
import { UesNavCore } from './core.js'
import type { NmnAction } from '../nmn/types.js'

export class UesNavService {
  private world = new UesWorldCore()
  private nav = new UesNavCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async compile(userId: string, input: { projectId: string; name: string; seed: string; from?: [number, number]; action?: NmnAction }) {
    this.store.getProject(input.projectId, userId)
    const world = this.world.generate(input.seed, 32, input.from ?? [8, 8])
    const compiled = this.nav.compile(world.terrain, world.roads, world.settlements)
    const from = input.from ?? [world.settlements[0]?.cx ?? 4, world.settlements[0]?.cz ?? 4] as [number, number]
    const route = this.nav.route(compiled.grid, from, input.action ?? 'flee', world.settlements)
    const payload = { format: 'ues-nav-bundle-v1', compiled, route, verification: { valid: compiled.verification.valid && route.verification.valid } }
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-nav.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-nav+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'runtime.ues-nav', producer: 'ues.navigation',
      verification: payload.verification,
      metadata: { action: input.action ?? 'flee', found: route.path.found },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
