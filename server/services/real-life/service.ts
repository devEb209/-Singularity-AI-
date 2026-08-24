import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { RealLifeCore } from './core.js'
import type { RealLifeRequest } from './types.js'

export class RealLifeService {
  private core = new RealLifeCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  catalog() {
    return {
      thesisComplement: true,
      replacesTeseDosD: false,
      closedModuleList: false,
      realismMandatory: false,
      notLimitedToGraphicsOrPhysics: true,
      data: this.core.catalog.list(),
    }
  }

  registerDomain(input: Parameters<RealLifeCore['register']>[0]) {
    return { domain: this.core.register(input), closedModuleList: false }
  }

  async compose(userId: string, input: { projectId: string; name: string } & RealLifeRequest) {
    this.store.getProject(input.projectId, userId)
    const composition = this.core.compose(input)
    const bytes = Buffer.from(JSON.stringify(composition, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const name = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-real-life.json`
    const storagePath = join(directory, `${fileId}-${name}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId,
      userId,
      projectId: input.projectId,
      name,
      mimeType: 'application/vnd.snb.real-life+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath,
      createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId,
      fileId: file.id,
      type: 'model.real-life-universal',
      producer: 'ues.real-life-universal',
      verification: {
        valid: composition.verification.valid,
        notLimitedToGraphicsOrPhysics: true,
        realismMandatory: false,
        closedModuleList: false,
        consistentPhysics: composition.physics.consistency.consistent,
      },
      metadata: {
        mode: composition.mode,
        domains: composition.domains.selected.map(item => item.id),
        gpp: composition.dThesis.gpp.score,
        hardware: composition.hardwareAdaptation.tier,
      },
      license: 'Apache-2.0',
    })
    return { composition, file: { ...file, storagePath: undefined }, artifact }
  }
}
