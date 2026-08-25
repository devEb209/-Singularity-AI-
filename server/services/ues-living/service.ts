import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { DThesisCore } from '../d-thesis/core.js'
import { mix, tone } from '../ues-audio/mixer.js'
import { optimizeLoop } from '../ues-optimize/loop.js'
import { defaultRepresentations } from '../real-life/optimize.js'
import { sweptAabb } from '../ues-physics/ccd.js'
import { profile } from '../ues-profiler/measure.js'
import { UesSocietyCore } from '../ues-society/core.js'
import { UesWorldCore } from '../ues-world/core.js'
import { stride } from '../ues-motion/locomotion.js'

export class UesLivingWorldService {
  private world = new UesWorldCore()
  private society = new UesSocietyCore()
  private thesis = new DThesisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; seed: string }) {
    this.store.getProject(input.projectId, userId)
    const measured = profile([
      { name: 'world', budgetMs: 80, fn: () => { this.world.generate(input.seed, 32, [10, 10]) } },
      { name: 'society', budgetMs: 120, fn: () => { this.society.simulate(input.seed, 4) } },
    ])
    const world = this.world.generate(input.seed, 32, [10, 10])
    const society = this.society.simulate(input.seed, 6)
    const audio = mix([{ id: 'amb', samples: tone(196, 0.12), sampleRate: 8000, gain: 0.4, delay: 0 }])
    const motion = stride(12)
    const physics = sweptAabb(
      { id: 'a', position: [0, 1.2, 0], velocity: [0, -8, 0], half: [0.3, 0.3, 0.3] },
      { id: 'b', position: [0, 0, 0], velocity: [0, 0, 0], half: [2, 0.2, 2] },
      0.2,
    )
    const optimize = optimizeLoop(defaultRepresentations('real-life'), 7)
    const dThesis = this.thesis.evaluate({
      objective: `Mundo vivo a partir de ${input.seed}`,
      constraints: ['CPU only', 'amostra populacional', 'D-O15 sem destruir qualidade'],
      resources: ['world', 'nav', 'society', 'audio', 'profiler'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 8 },
    })
    const payload = {
      format: 'ues-living-world-v1',
      world: { settlements: world.settlements.length, buildings: world.verification.buildings, plants: world.verification.plants, roads: world.verification.roadCells, streaming: world.streaming.resident },
      society: { sampleSize: society.sampleSize, moved: society.verification.moved, stocks: society.stocks },
      audio: { clipping: audio.metrics.clipping, sampleRate: audio.sampleRate },
      motion: motion.verification,
      physics: { toi: physics?.toi ?? null },
      optimize: { accepted: optimize.accepted, rollback: optimize.rollback },
      profiler: measured,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: world.verification.valid && society.verification.valid && audio.verification.finite && motion.verification.valid && Boolean(physics),
        gpu: false,
      },
    }
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-living.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-living+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'runtime.ues-living-world', producer: 'ues.living-world',
      verification: payload.verification,
      metadata: { settlements: world.settlements.length, sampleSize: society.sampleSize },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
