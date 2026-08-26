import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { DThesisCore } from '../d-thesis/core.js'
import { tone } from '../ues-audio/mixer.js'
import { spatialize } from '../ues-audio/hrtf.js'
import { loopSeam } from '../ues-audio/loop.js'
import { UesCityCore } from '../ues-city/core.js'
import { clipLibrary } from '../ues-motion/clips.js'
import { match, queryFor, transition } from '../ues-motion/match.js'
import { UesNavmeshCore } from '../ues-navmesh/core.js'
import { UesPhysicsCore } from '../ues-physics/core.js'
import { UesReferenceCore } from '../ues-reference/core.js'
import { UesVfxCore } from '../ues-vfx/core.js'

export class UesContinuumService {
  private physics = new UesPhysicsCore()
  private vfx = new UesVfxCore()
  private navmesh = new UesNavmeshCore()
  private city = new UesCityCore()
  private reference = new UesReferenceCore()
  private thesis = new DThesisCore()
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async build(userId: string, input: { projectId: string; name: string; prompt?: string; seed?: string }) {
    this.store.getProject(input.projectId, userId)
    const prompt = input.prompt ?? 'cidade habitada'
    const seed = input.seed ?? prompt.slice(0, 80)
    const physics = this.physics.process()
    const vfx = this.vfx.process()
    const navmesh = this.navmesh.compile()
    const city = this.city.simulate(seed, 6)
    const reference = this.reference.process(prompt)
    const motion = match(queryFor('walk'), clipLibrary(), 'walk')
    const wave = tone(280, 0.08)
    const spatial = spatialize(wave, -0.9)
    const seam = loopSeam(wave, 24)
    const dThesis = this.thesis.evaluate({
      objective: `Continuidade UES para ${prompt}: física convexa, VFX, navmesh, censo, referência e áudio espacial`,
      constraints: ['CPU only', 'sem visão', 'sem WebRTC', 'sem shader GPU'],
      resources: ['GJK', 'fluids', 'navmesh', 'census', 'cards', 'ITD/ILD'],
      priorities: { quality: 8, performance: 7, safety: 9, cost: 5, scalability: 8 },
    })
    const payload = {
      format: 'ues-continuum-v1',
      physics: physics.verification,
      vfx: vfx.verification,
      navmesh: navmesh.verification,
      city: { sampleSize: city.sampleSize, districts: city.districts.length, valid: city.verification.valid },
      reference: reference.verification,
      motion: { clip: motion.clip.kind, idleToRun: transition('idle', 'run').allowed },
      audio: { leftDominant: spatial.leftEnergy > spatial.rightEnergy, loopImproved: seam.improved, measuredHrtf: false },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: physics.verification.valid && vfx.verification.valid && navmesh.verification.valid && city.verification.valid && reference.verification.valid && motion.clip.kind === 'walk' && seam.improved,
        gpu: false,
        webrtc: false,
        vision: false,
        measuredHrtf: false,
      },
    }
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-continuum.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-continuum+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'production.ues-continuum', producer: 'ues.continuum',
      verification: payload.verification,
      metadata: { districts: city.districts.length, sampleSize: city.sampleSize, gpp: dThesis.gpp.score },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
