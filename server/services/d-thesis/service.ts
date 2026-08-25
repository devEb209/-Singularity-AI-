import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { DThesisComplement, type ComplementInput } from './complement.js'
import { DThesisCore } from './core.js'
import { dRegistry } from './registry.js'
import { dThesisScope, type DContext } from './types.js'

export class DThesisService {
  private core = new DThesisCore()
  private complementCore = new DThesisComplement()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  registry() {
    return {
      thesis: 'Tese dos D',
      physicalDimensions: false,
      roadmapLevels: false,
      allAvailableInV1: true,
      dO15: 'transversal quality-preserving optimization',
      scope: dThesisScope,
      complement: ['real-life-universal', 'nmn', 'autonomous-development'],
      data: dRegistry,
    }
  }

  async evaluate(userId: string, input: { projectId: string; name: string; context: DContext }) {
    this.store.getProject(input.projectId, userId)
    const evaluation = this.core.evaluate(input.context)
    const bytes = Buffer.from(JSON.stringify(evaluation, null, 2))
    const dir = join(this.root, userId)
    await mkdir(dir, { recursive: true })
    const fileId = id('file')
    const name = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-d-thesis.json`
    const storagePath = join(dir, `${fileId}-${name}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name,
      mimeType: 'application/vnd.snb.d-thesis+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId,
      fileId: file.id,
      type: 'analysis.d-thesis',
      producer: 'snb-ues.d-thesis',
      verification: {
        valid: evaluation.selectedDs.length > 0 && evaluation.gpp.score >= 0,
        dCount: dRegistry.length,
        allAvailable: evaluation.governance.allDsAvailable,
        absolutePerfectionClaim: false,
      },
      metadata: {
        selectedDs: evaluation.selectedDs.map(item => item.key),
        gppScore: evaluation.gpp.score,
        do15Accepted: evaluation.dO15.decisions.filter(item => item.accepted).length,
      },
      license: 'Apache-2.0',
    })
    return { evaluation, file: { ...file, storagePath: undefined }, artifact }
  }

  async complement(userId: string, input: { projectId: string; name: string } & ComplementInput) {
    this.store.getProject(input.projectId, userId)
    const evaluation = this.complementCore.evaluate({ ...input, userId })
    const bytes = Buffer.from(JSON.stringify(evaluation, null, 2))
    const dir = join(this.root, userId)
    await mkdir(dir, { recursive: true })
    const fileId = id('file')
    const name = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-d-thesis-complement.json`
    const storagePath = join(dir, `${fileId}-${name}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name,
      mimeType: 'application/vnd.snb.d-thesis-complement+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId,
      fileId: file.id,
      type: 'analysis.d-thesis-complement',
      producer: 'snb-ues.d-thesis-complement',
      verification: {
        valid: evaluation.verification.valid,
        graphicsOnlyInterpretation: false,
        absolutePerfectionClaim: false,
        notLimitedToGraphicsOrPhysics: true,
      },
      metadata: { summary: evaluation.summary, mode: input.mode ?? 'real-life' },
      license: 'Apache-2.0',
    })
    return { evaluation, file: { ...file, storagePath: undefined }, artifact, summary: evaluation.summary }
  }
}
