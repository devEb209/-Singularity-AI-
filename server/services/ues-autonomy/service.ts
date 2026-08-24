import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { AppError } from '../../lib/errors.js'
import type { FileAsset } from '../../domain.js'
import { id, now } from '../../lib/id.js'
import type { Store } from '../../repositories/store.js'
import type { ArtifactGraphService } from '../artifact-graph.js'
import { AutonomyCore } from './core.js'
import type { AutonomyProject, HumanControl } from './types.js'

interface AutonomyState { projects: AutonomyProject[] }

export class AutonomyStateStore {
  private locks = new Map<string, Promise<unknown>>()
  constructor(private root = resolve('./data/ues-autonomy')) {}
  private path(userId: string) {
    return join(this.root, `${createHash('sha256').update(userId).digest('hex')}.json`)
  }
  async read(userId: string): Promise<AutonomyState> {
    try { return JSON.parse(await readFile(this.path(userId), 'utf8')) as AutonomyState } catch { return { projects: [] } }
  }
  async update<T>(userId: string, mutate: (state: AutonomyState) => T | Promise<T>) {
    const previous = this.locks.get(userId) ?? Promise.resolve()
    const next = previous.catch(() => undefined).then(async () => {
      const state = await this.read(userId)
      const result = await mutate(state)
      const path = this.path(userId)
      const temporary = `${path}.${process.pid}.${Date.now()}.tmp`
      await mkdir(this.root, { recursive: true })
      await writeFile(temporary, JSON.stringify(state, null, 2), { flag: 'wx' })
      await rename(temporary, path)
      return result
    })
    this.locks.set(userId, next)
    try { return await next as T } finally { if (this.locks.get(userId) === next) this.locks.delete(userId) }
  }
}

export class AutonomyService {
  private core = new AutonomyCore()
  constructor(
    private store: Store,
    private artifacts: ArtifactGraphService,
    private root = resolve('./data/uploads'),
    private state = new AutonomyStateStore(),
  ) {}

  capabilities() {
    return {
      name: 'UES Autonomous Development',
      thesisComplement: true,
      decisionWindowMs: 330_000,
      silenceIsNotAuthorization: true,
      usedForGlobalTraining: false,
      humanControl: true,
      anyViableThing: 'computationally representable and resource-compatible; not magical',
    }
  }

  async create(userId: string, input: { projectId: string; name: string; intent: string; constraints?: string[] }) {
    this.store.getProject(input.projectId, userId)
    const project = this.core.create({ userId, ...input })
    await this.state.update(userId, state => { state.projects.push(project) })
    return this.persist(userId, project, `${input.name}-autonomy`)
  }

  async list(userId: string, projectId: string) {
    this.store.getProject(projectId, userId)
    return (await this.state.read(userId)).projects.filter(item => item.projectId === projectId)
  }

  async tick(userId: string, autonomyId: string, at?: number) {
    const project = await this.mutate(userId, autonomyId, current => this.core.tick(current, at))
    return this.persist(userId, project, `${project.name}-tick`)
  }

  async control(userId: string, autonomyId: string, action: HumanControl, alteration?: string) {
    const project = await this.mutate(userId, autonomyId, current => this.core.control(current, action, alteration))
    return this.persist(userId, project, `${project.name}-control`)
  }

  async decide(userId: string, autonomyId: string, answer: string) {
    const project = await this.mutate(userId, autonomyId, current => {
      this.core.decide(current, answer)
      return current
    })
    return this.persist(userId, project, `${project.name}-decision`)
  }

  async ingest(userId: string, autonomyId: string, claim: Parameters<AutonomyCore['ingestKnowledge']>[1]) {
    const project = await this.mutate(userId, autonomyId, current => {
      this.core.ingestKnowledge(current, claim)
      return current
    })
    return { knowledge: project.knowledge, isolation: project.isolation }
  }

  private async mutate(userId: string, autonomyId: string, fn: (project: AutonomyProject) => AutonomyProject) {
    return this.state.update(userId, state => {
      const project = state.projects.find(item => item.id === autonomyId)
      if (!project) throw new AppError('Projeto de autonomia não encontrado.', 404, 'AUTONOMY_NOT_FOUND')
      if (project.userId !== userId && !project.members.some(member => member.userId === userId)) {
        throw new AppError('Projeto de autonomia isolado deste usuário.', 403, 'AUTONOMY_ISOLATED')
      }
      const next = fn(project)
      const index = state.projects.findIndex(item => item.id === autonomyId)
      state.projects[index] = next
      return next
    })
  }

  private async persist(userId: string, project: AutonomyProject, name: string) {
    const evaluation = this.core.evaluate(project)
    const bytes = Buffer.from(JSON.stringify(evaluation, null, 2))
    const directory = join(this.root, userId)
    await mkdir(directory, { recursive: true })
    const fileId = id('file')
    const safe = `${name.replace(/[^a-zA-Z0-9._-]/g, '_')}.json`
    const storagePath = join(directory, `${fileId}-${safe}`)
    await writeFile(storagePath, bytes, { flag: 'wx' })
    const file: FileAsset = {
      id: fileId, userId, projectId: project.projectId, name: safe,
      mimeType: 'application/vnd.snb.ues-autonomy+json',
      size: bytes.length,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      storagePath, createdAt: now(),
    }
    this.store.createFile(file)
    const artifact = this.artifacts.register(userId, {
      projectId: project.projectId,
      fileId: file.id,
      type: 'plan.ues-autonomy',
      producer: 'ues.autonomous-development',
      verification: evaluation.verification,
      metadata: { stage: project.stage, cycle: project.cycle, isolation: project.isolation.tenant },
      license: 'Apache-2.0',
    })
    return { evaluation, file: { ...file, storagePath: undefined }, artifact }
  }
}
