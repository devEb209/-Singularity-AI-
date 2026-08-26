import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { islands, sweptAabb, type Aabb } from './ccd.js'
import { UesPhysicsCore } from './core.js'

export class UesPhysicsService {
  private core = new UesPhysicsCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async simulate(userId: string, input: { projectId: string; name: string }) {
    this.store.getProject(input.projectId, userId)
    const bodies: Aabb[] = [
      { id: 'fast', position: [0, 2, 0], velocity: [0, -20, 0], half: [0.4, 0.4, 0.4] },
      { id: 'ground', position: [0, 0, 0], velocity: [0, 0, 0], half: [4, 0.25, 4] },
      { id: 'side', position: [1.2, 1, 0], velocity: [-2, 0, 0], half: [0.3, 0.3, 0.3] },
    ]
    const hits = [sweptAabb(bodies[0], bodies[1], 1 / 30), sweptAabb(bodies[2], bodies[0], 1 / 30)].filter((item): item is NonNullable<typeof item> => Boolean(item))
    const groups = islands(hits)
    const payload = {
      format: 'ues-physics-ccd-v1',
      hits,
      islands: groups,
      limitations: ['Swept AABB CCD remains available', 'Convex GJK/EPA lives on /physics/convex'],
      verification: { valid: hits.length > 0 && groups.length > 0, toiPositive: hits.every(hit => hit.toi >= 0) },
    }
    return this.persist(userId, input, payload, `${input.name}-ccd.json`, 'simulation.ues-ccd', 'ues.physics-ccd', { hits: hits.length, islands: groups.length })
  }

  async convex(userId: string, input: { projectId: string; name: string }) {
    this.store.getProject(input.projectId, userId)
    const payload = this.core.process()
    return this.persist(userId, input, payload, `${input.name}-convex.json`, 'simulation.ues-convex', 'ues.physics-convex', { gjk: payload.verification.gjk, epa: payload.verification.epa })
  }

  private async persist(userId: string, input: { projectId: string; name: string }, payload: { verification: Record<string, unknown> }, rawName: string, type: string, producer: string, metadata: Record<string, unknown>) {
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = rawName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-physics+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type, producer,
      verification: payload.verification,
      metadata,
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
