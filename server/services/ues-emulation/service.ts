import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { creationPlan } from '../ues-creation/plan.js'
import { DThesisCore } from '../d-thesis/core.js'
import { UesFnwsCore } from '../ues-fnws/core.js'
import { UesPlanetCore } from '../ues-planet/core.js'
import { UesSynthesisCore } from '../ues-synthesis/core.js'
import { UesTitkoCore } from '../ues-titko/core.js'
import { UesUmotionCore } from '../ues-umotion/core.js'

export class UesEmulationService {
  private planet = new UesPlanetCore()
  private water = new UesFnwsCore()
  private synthesis = new UesSynthesisCore()
  private titko = new UesTitkoCore()
  private motion = new UesUmotionCore()
  private thesis = new DThesisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string }) {
    this.store.getProject(input.projectId, userId)
    const prompt = input.prompt ?? 'emulacao terrestre'
    const planet = this.planet.generate(prompt.slice(0, 40), 36)
    const water = this.water.process(prompt.slice(0, 40))
    const world = this.synthesis.synthesize({ kind: 'earth-like', seed: prompt.slice(0, 40), mutations: [{ field: 'seaLevel', delta: 0.08 }] })
    const titko = this.titko.process()
    const motion = this.motion.process()
    const creation = creationPlan(prompt, 8)
    const dThesis = this.thesis.evaluate({
      objective: `Emulação mundial UES: ${prompt}. Dados/regras → Tese dos D → adaptação → sistema → D-O15.`,
      constraints: ['não reivindicar NASA', 'não reivindicar visão', 'não armazenar 16K', 'não simular cada átomo'],
      resources: ['planet', 'fnws', 'titko', 'umotion', 'synthesis'],
      priorities: { quality: 8, performance: 9, safety: 9, cost: 5, scalability: 10 },
    })
    const payload = {
      format: 'ues-emulation-v1',
      complement: 'does-not-replace-tese-dos-d',
      planet: { land: planet.land, ocean: planet.ocean, rivers: planet.rivers, fidelity: planet.fidelity, nasa: false },
      water: water.verification,
      synthesis: world.verification,
      titko: titko.verification,
      motion: motion.verification,
      creation,
      universe: planet.universe.claim,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: planet.verification.valid && water.verification.valid && world.verification.valid && titko.verification.valid && motion.verification.valid && creation.verification.valid,
        nasa: false,
        vision: false,
        storedBitmap16k: false,
        atomSim: false,
        instantAaa: false,
      },
    }
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-emulation.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-emulation+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'production.ues-emulation', producer: 'ues.emulation',
      verification: payload.verification,
      metadata: { land: planet.land, ocean: planet.ocean, gpp: dThesis.gpp.score },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
