import { AppError } from '../lib/errors.js'
import { id, now } from '../lib/id.js'
import type { Store } from '../repositories/store.js'

export class CheckpointService {
  constructor(private store: Store) {}
  create(userId: string, projectId: string, label: string) {
    const project = this.store.getProject(projectId, userId)
    const snapshot = {
      version: 1,
      scope: 'project-metadata-and-manifest',
      project: { name: project.name, description: project.description, status: project.status },
      memoryIds: this.store.listMemories(userId, projectId).map(item => item.id),
      fileManifest: this.store.listFiles(userId, projectId).map(({ storagePath: _, ...item }) => item),
      conversationIds: this.store.listConversations(userId).filter(item => item.projectId === projectId).map(item => item.id),
    }
    return this.store.createCheckpoint({ id: id('checkpoint'), userId, projectId, label, snapshot, createdAt: now() })
  }
  list(userId: string, projectId: string) { this.store.getProject(projectId, userId); return this.store.listCheckpoints(projectId, userId) }
  restore(userId: string, checkpointId: string) {
    const checkpoint = this.store.getCheckpoint(checkpointId, userId); const project = checkpoint.snapshot.project
    if (!project || typeof project !== 'object') throw new AppError('Checkpoint incompatível.', 409, 'INVALID_CHECKPOINT')
    const state = project as { name?: unknown; description?: unknown; status?: unknown }
    if (typeof state.name !== 'string' || typeof state.description !== 'string' || (state.status !== 'active' && state.status !== 'archived')) throw new AppError('Estado do projeto inválido no checkpoint.', 409, 'INVALID_CHECKPOINT_STATE')
    const restored = this.store.updateProject(checkpoint.projectId, userId, { name: state.name, description: state.description, status: state.status })
    const restoredAt = now(); this.store.markCheckpointRestored(checkpointId, restoredAt)
    this.store.audit({ id: id('audit'), userId, action: 'checkpoint.restore', resource: checkpointId, metadata: { projectId: checkpoint.projectId, scope: checkpoint.snapshot.scope }, createdAt: restoredAt })
    return { checkpoint: { ...checkpoint, restoredAt }, project: restored, scope: checkpoint.snapshot.scope, warning: 'A V1 restaura metadados do projeto. Arquivos são imutáveis e o manifesto permite restauração completa em uma etapa posterior.' }
  }
}
