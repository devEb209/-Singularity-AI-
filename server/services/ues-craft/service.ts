import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { DThesisCore } from '../d-thesis/core.js'
import { UesAnatomyCore } from '../ues-anatomy/core.js'
import { UesImageCore } from '../ues-image/core.js'
import { UesNetCore } from '../ues-net/core.js'
import { UesRetopoCore } from '../ues-retopo/core.js'

export class UesCraftService {
  private retopo = new UesRetopoCore()
  private anatomy = new UesAnatomyCore()
  private net = new UesNetCore()
  private image = new UesImageCore()
  private thesis = new DThesisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    this.store.getProject(input.projectId, userId)
    const prompt = input.prompt ?? 'personagem humano'
    const retopo = this.retopo.process(prompt)
    const anatomy = this.anatomy.process(prompt)
    const net = this.net.simulate()
    const image = this.image.process()
    const dThesis = this.thesis.evaluate({
      objective: `Craft UES: retopo, anatomy, net e imagem para ${prompt}`,
      constraints: ['CPU only', 'sem WebRTC', 'sem SR neural'],
      resources: ['mesh', 'rig', 'net-sim', 'filters'],
      priorities: { quality: 8, performance: 7, safety: 9, cost: 5, scalability: 7 },
    })
    const payload = {
      format: 'ues-craft-v1',
      retopo: retopo.verification,
      anatomy: anatomy.verification,
      net: net.verification,
      image: image.verification,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: retopo.verification.valid && anatomy.verification.valid && net.verification.valid && image.verification.valid,
        gpu: false,
        webrtc: false,
        learnedSr: false,
      },
    }
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-craft.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-craft+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'production.ues-craft', producer: 'ues.craft',
      verification: payload.verification,
      metadata: { bones: anatomy.verification.boneCount, psnr: image.superResolution.psnr },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
