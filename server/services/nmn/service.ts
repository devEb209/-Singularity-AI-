import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { AppError } from '../../lib/errors.js'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { NmnCore, warCast } from './core.js'
import { characterFiles, NmnStateStore } from './persist.js'
import type { NmnCharacter, WorldEvent } from './types.js'
import { normalizePersonality } from './mind.js'

export class NmnService {
  private core = new NmnCore()
  constructor(
    private store: Store,
    private artifacts: ArtifactGraphService,
    private root = resolve('./data/uploads'),
    private state = new NmnStateStore(),
  ) {}

  capabilities() {
    return {
      name: 'NMN — Natural Mindset of NPCs',
      thesisComplement: true,
      consciousnessClaim: false,
      scriptIsNotPrimaryIntelligence: true,
      voice: 'adapter-required',
      fidelity: ['dormant', 'low', 'medium', 'high', 'full'],
      perception: 'individual, non-omniscient',
      memory: ['active', 'recent', 'important', 'consolidated', 'historical'],
    }
  }

  async createCharacter(userId: string, input: Omit<NmnCharacter, 'memory' | 'history' | 'causal' | 'tick' | 'lastAction' | 'lastReason'> & { memory?: NmnCharacter['memory'] }) {
    this.store.getProject(input.projectId, userId)
    const character: NmnCharacter = {
      ...input,
      personality: normalizePersonality(input.personality),
      memory: input.memory ?? [],
      history: [],
      causal: [],
      tick: 0,
    }
    return this.state.update(userId, state => {
      if (state.characters.some(item => item.id === character.id && item.projectId === character.projectId)) {
        throw new AppError('Personagem NMN já existe neste projeto.', 409, 'NMN_EXISTS')
      }
      state.characters.push(character)
      Object.assign(state.files, characterFiles(character))
      return character
    })
  }

  async list(userId: string, projectId: string) {
    this.store.getProject(projectId, userId)
    const state = await this.state.read(userId)
    return state.characters.filter(item => item.projectId === projectId)
  }

  async simulate(userId: string, input: { projectId: string; name: string; event: WorldEvent; characterIds?: string[]; ticks?: number }) {
    this.store.getProject(input.projectId, userId)
    const result = await this.state.update(userId, state => {
      const selected = input.characterIds?.length
        ? state.characters.filter(item => item.projectId === input.projectId && input.characterIds!.includes(item.id))
        : state.characters.filter(item => item.projectId === input.projectId)
      if (!selected.length) throw new AppError('Nenhum personagem NMN disponível neste projeto.', 400, 'NMN_EMPTY')
      const simulation = this.core.simulate({ characters: selected, event: input.event, ticks: input.ticks })
      for (const next of simulation.snapshot) {
        const index = state.characters.findIndex(item => item.id === next.id)
        if (index >= 0) state.characters[index] = next
        Object.assign(state.files, characterFiles(next))
      }
      return simulation
    })
    return this.persist(userId, input.projectId, input.name, 'simulation.nmn', result)
  }

  async war(userId: string, input: { projectId: string; name: string }) {
    this.store.getProject(input.projectId, userId)
    const seeded = warCast(input.projectId)
    await this.state.update(userId, state => {
      for (const character of seeded) {
        const index = state.characters.findIndex(item => item.id === character.id && item.projectId === input.projectId)
        if (index >= 0) state.characters[index] = character
        else state.characters.push(character)
        Object.assign(state.files, characterFiles(character))
      }
    })
    const result = this.core.war(input.projectId, 1)
    await this.state.update(userId, state => {
      for (const next of result.invasionPass.snapshot) {
        const index = state.characters.findIndex(item => item.id === next.id)
        if (index >= 0) state.characters[index] = next
        Object.assign(state.files, characterFiles(next))
      }
    })
    return this.persist(userId, input.projectId, input.name, 'simulation.nmn-war', result)
  }

  private async persist(userId: string, projectId: string, name: string, type: string, payload: unknown) {
    const bytes = Buffer.from(JSON.stringify(payload, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${name.replace(/[^a-zA-Z0-9._-]/g, '_')}-nmn.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId, name: safe,
      mimeType: 'application/vnd.snb.nmn+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const verification = (payload as { invasionPass?: { verification?: { valid?: boolean } }; verification?: { valid?: boolean } }).invasionPass?.verification
      ?? (payload as { verification?: { valid?: boolean } }).verification
      ?? { valid: true }
    const artifact = this.artifacts.register(userId, {
      projectId, fileId: file.id, type, producer: 'ues.nmn',
      verification: { valid: verification.valid === true, consciousnessClaim: false, voice: 'adapter-required' },
      metadata: { complement: 'tese-dos-d', omniscient: false },
      license: 'Apache-2.0',
    })
    return { result: payload, file: { ...file, storagePath: undefined }, artifact }
  }
}
