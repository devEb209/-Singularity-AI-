import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { DThesisCore } from '../d-thesis/core.js'
import { UesConstraintsCore } from '../ues-constraints/core.js'
import { UesCorpusCore } from '../ues-corpus/core.js'
import { UesCriticCore } from '../ues-critic/core.js'
import { UesRegressCore } from '../ues-regress/core.js'
import { UesStreamCore } from '../ues-stream/core.js'

export class UesForgeService {
  private corpus = new UesCorpusCore()
  private critic = new UesCriticCore()
  private constraints = new UesConstraintsCore()
  private regress = new UesRegressCore()
  private stream = new UesStreamCore()
  private thesis = new DThesisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    this.store.getProject(input.projectId, userId)
    const prompt = input.prompt ?? 'forja semantica'
    const corpus = this.corpus.process(prompt)
    const critic = this.critic.process()
    const constraints = this.constraints.process()
    const regress = this.regress.process()
    const stream = this.stream.process()
    const dThesis = this.thesis.evaluate({
      objective: `Forja UES para ${prompt}: corpus, críticos, restrições, regressão e streaming`,
      constraints: ['CPU only', 'sem visão', 'sem GPU', 'sem GIS'],
      resources: ['catalog', 'critics', 'solver', 'raster', 'chunks'],
      priorities: { quality: 8, performance: 7, safety: 9, cost: 5, scalability: 8 },
    })
    const payload = {
      format: 'ues-forge-v1',
      corpus: { count: corpus.count, kinds: corpus.kinds, valid: corpus.verification.valid },
      critic: critic.verification,
      constraints: constraints.verification,
      regress: { accept: regress.accepted, rollback: regress.rollback, ssim: regress.mild.ssim },
      stream: stream.verification,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: corpus.verification.valid && critic.verification.valid && constraints.verification.valid && regress.verification.valid && stream.verification.valid,
        gpu: false,
        vision: false,
        gis: false,
        specialistDerived: false,
      },
    }
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-forge.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-forge+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'production.ues-forge', producer: 'ues.forge',
      verification: payload.verification,
      metadata: { kinds: corpus.kinds.length, rollback: regress.rollback, gpp: dThesis.gpp.score },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
