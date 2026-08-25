import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { mix, spatialGain, syncEvents, tone } from './mixer.js'

export class UesAudioService {
  constructor(private store: Store, private artifacts: ArtifactGraphService, private root = resolve('./data/uploads')) {}

  async mix(userId: string, input: { projectId: string; name: string; listener?: [number, number] }) {
    this.store.getProject(input.projectId, userId)
    const listener = input.listener ?? [0, 0]
    const clips = [
      { id: 'bed', samples: tone(220, 0.2), sampleRate: 8000, gain: spatialGain(listener, [0, 0]), delay: 0 },
      { id: 'event', samples: tone(660, 0.08), sampleRate: 8000, gain: spatialGain(listener, [4, 2]) * 0.7, delay: 400 },
    ]
    const mixed = mix(clips)
    const payload = { ...mixed, events: syncEvents([{ tick: 3, clipId: 'event' }], 3), spatial: true, codecs: false }
    const bytes = Buffer.from(JSON.stringify({ ...payload, samples: payload.samples.slice(0, 64), sampleCount: payload.samples.length }, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${input.name.replace(/[^a-zA-Z0-9._-]/g, '_')}-audio.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: input.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-audio+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: input.projectId, fileId: file.id, type: 'audio.ues-mix', producer: 'ues.audio-mixer',
      verification: { valid: mixed.verification.finite && !mixed.metrics.clipping, codecs: false },
      metadata: { clips: clips.length, sampleRate: 8000 },
      license: 'Apache-2.0',
    })
    return { result: { ...payload, samples: undefined, sampleCount: payload.samples.length }, file: { ...file, storagePath: undefined }, artifact }
  }
}
