import type { ApprovalRequest, ArtifactRecord, DivineEngineCommand, DivineEngineSettings, BenchmarkCampaign, BenchmarkJob, CapabilityManifest, CircuitState, Conversation, DivineOsModule, DivineOsProject, DivineProject, EvidenceLink, EvidenceSource, ExternalModel, FileAsset, KnowledgeClaim, Memory, Message, Mission, MissionContract, MissionEvent, MissionTask, ModelEvaluation, ModelHealthSample, Project, ProjectCheckpoint, PuterExecutionReport, TaskLease, ToolExecution, WorkerRecord } from '../domain.js'

export interface StoredUser { id: string; email: string; name: string; passwordHash: string; createdAt: string }
export interface StoredRefreshToken { id: string; userId: string; tokenHash: string; expiresAt: string; revokedAt?: string; createdAt: string }
export interface StoredPasswordResetToken {id:string;userId:string;tokenHash:string;expiresAt:string;usedAt?:string;createdAt:string}
export interface AuditEvent { id: string; userId?: string; action: string; resource?: string; metadata?: Record<string, unknown>; createdAt: string }

export interface Store {
  createConversation(userId: string, title: string, projectId?: string): Conversation
  getConversation(conversationId: string, userId: string): Conversation
  listConversations(userId: string): Conversation[]
  addMessage(conversationId: string, userId: string, role: Message['role'], content: string, metadata?: Message['metadata']): Message
  listMessages(conversationId: string, userId: string): Message[]
  createProject(userId: string, name: string, description?: string): Project
  listProjects(userId: string): Project[]
  getProject(projectId: string, userId: string): Project
  updateProject(projectId: string, userId: string, update: Partial<Pick<Project, 'name' | 'description' | 'status'>>): Project
  createMemory(userId: string, content: string, kind: Memory['kind'], importance: number, projectId?: string): Memory
  listMemories(userId: string, projectId?: string): Memory[]
  deleteMemory(memoryId: string, userId: string): void
  createFile(file: FileAsset): FileAsset
  listFiles(userId: string, projectId?: string): FileAsset[]
  getFile(fileId: string, userId: string): FileAsset
  deleteFile(fileId: string, userId: string): FileAsset
  createMission(mission: Mission, contract: MissionContract, tasks: MissionTask[], event: MissionEvent): Mission
  getMission(missionId: string, userId: string): Mission
  getMissionContract(missionId: string): MissionContract
  updateMissionContract(contract: MissionContract): void
  listMissions(userId: string): Mission[]
  updateMission(mission: Mission): void
  listMissionTasks(missionId: string): MissionTask[]
  getMissionTask(taskId: string): MissionTask | undefined
  updateMissionTask(task: MissionTask): void
  addMissionEvent(event: MissionEvent): void
  listMissionEvents(missionId: string, after?: string): MissionEvent[]
  createCheckpoint(checkpoint: ProjectCheckpoint): ProjectCheckpoint
  getCheckpoint(checkpointId: string, userId: string): ProjectCheckpoint
  listCheckpoints(projectId: string, userId: string): ProjectCheckpoint[]
  markCheckpointRestored(checkpointId: string, restoredAt: string): void
  syncExternalModels(models: ExternalModel[], source: 'puter', seenAt: string): { created: number; updated: number; unavailable: number }
  listExternalModels(source: 'puter', options?: { provider?: string; available?: boolean; limit?: number; offset?: number }): ExternalModel[]
  countExternalModels(source: 'puter'): number
  getExternalModel(key: string): ExternalModel | undefined
  saveModelEvaluation(evaluation: ModelEvaluation): void
  listModelEvaluations(modelKey?: string): ModelEvaluation[]
  createBenchmarkCampaign(campaign: BenchmarkCampaign, jobs: BenchmarkJob[]): BenchmarkCampaign
  getBenchmarkCampaign(campaignId: string, userId?: string): BenchmarkCampaign
  listBenchmarkCampaigns(userId: string): BenchmarkCampaign[]
  updateBenchmarkCampaign(campaign: BenchmarkCampaign): void
  listBenchmarkJobs(campaignId: string, options?: { status?: BenchmarkJob['status']; limit?: number; offset?: number }): BenchmarkJob[]
  getBenchmarkJob(jobId: string): BenchmarkJob | undefined
  updateBenchmarkJob(job: BenchmarkJob): void
  createToolExecution(execution: ToolExecution): ToolExecution
  updateToolExecution(execution: ToolExecution): void
  getToolExecution(executionId: string, userId: string): ToolExecution
  listToolExecutions(userId: string, limit?: number): ToolExecution[]
  getCircuitState(resourceKey: string): CircuitState | undefined
  upsertCircuitState(state: CircuitState): void
  saveModelHealthSample(sample: ModelHealthSample): void
  listModelHealthSamples(modelKey: string, limit?: number): ModelHealthSample[]
  upsertWorker(worker: WorkerRecord): void
  getWorker(workerId: string): WorkerRecord | undefined
  listWorkers(): WorkerRecord[]
  claimReadyTask(workerId: string, capabilities: string[], tokenHash: string, expiresAt: string, timestamp: string): { mission: Mission; task: MissionTask; lease: TaskLease } | undefined
  getTaskLease(taskId: string): TaskLease | undefined
  heartbeatTaskLease(taskId: string, workerId: string, tokenHash: string, expiresAt: string, timestamp: string): TaskLease
  releaseTaskLease(taskId: string, workerId: string): void
  recoverExpiredTaskLeases(timestamp: string): { recovered: number; failed: number }
  findCompletedToolExecutionByTask(taskId: string): ToolExecution | undefined
  createPuterExecutionReport(report: PuterExecutionReport): PuterExecutionReport
  listPuterExecutionReports(userId: string, limit?: number): PuterExecutionReport[]
  createApproval(request: ApprovalRequest): ApprovalRequest
  getApproval(approvalId: string, userId: string): ApprovalRequest
  listApprovals(userId: string, status?: ApprovalRequest['status']): ApprovalRequest[]
  updateApproval(request: ApprovalRequest): void
  getUserSettings(userId:string): Record<string,unknown>
  upsertUserSettings(userId:string,settings:Record<string,unknown>,updatedAt:string): Record<string,unknown>
  createEvidenceSource(source:EvidenceSource):EvidenceSource
  listEvidenceSources(userId:string,projectId?:string):EvidenceSource[]
  createKnowledgeClaim(claim:KnowledgeClaim):KnowledgeClaim
  listKnowledgeClaims(userId:string,projectId?:string):KnowledgeClaim[]
  getKnowledgeClaim(claimId:string,userId:string):KnowledgeClaim
  updateKnowledgeClaim(claim:KnowledgeClaim):void
  createEvidenceLink(link:EvidenceLink):EvidenceLink
  listEvidenceLinks(userId:string,claimId?:string):EvidenceLink[]
  upsertCapabilityManifest(manifest:CapabilityManifest):CapabilityManifest
  getCapabilityManifest(manifestId:string):CapabilityManifest|undefined
  listCapabilityManifests(options?:{status?:CapabilityManifest['status'];type?:CapabilityManifest['type'];capability?:string}):CapabilityManifest[]
  createDivineProject(project:DivineProject):DivineProject
  getDivineProject(divineId:string,userId:string):DivineProject
  listDivineProjects(userId:string):DivineProject[]
  updateDivineProject(project:DivineProject):void
  getDivineEngineSettings(projectId:string,userId:string):DivineEngineSettings|undefined
  upsertDivineEngineSettings(settings:DivineEngineSettings):DivineEngineSettings
  createDivineEngineCommand(command:DivineEngineCommand):DivineEngineCommand
  listDivineEngineCommands(projectId:string,userId:string):DivineEngineCommand[]
  createArtifact(record:ArtifactRecord):ArtifactRecord
  getArtifact(artifactId:string,userId:string):ArtifactRecord
  listArtifacts(userId:string,projectId?:string):ArtifactRecord[]
  updateArtifact(record:ArtifactRecord):void
  createDivineOsProject(project:DivineOsProject):DivineOsProject
  getDivineOsProject(projectId:string,userId:string):DivineOsProject
  listDivineOsProjects(userId:string):DivineOsProject[]
  updateDivineOsProject(project:DivineOsProject):void
  createDivineOsModule(module:DivineOsModule):DivineOsModule
  listDivineOsModules(projectId:string,userId:string):DivineOsModule[]
  createUser(user: StoredUser): StoredUser
  findUserByEmail(email: string): StoredUser | undefined
  findUserById(id: string): StoredUser | undefined
  saveRefreshToken(token: StoredRefreshToken): void
  findRefreshToken(tokenHash: string): StoredRefreshToken | undefined
  revokeRefreshToken(tokenHash: string): void
  revokeUserRefreshTokens(userId: string): void
  updateUserPassword(userId:string,passwordHash:string):void
  savePasswordResetToken(token:StoredPasswordResetToken):void
  findPasswordResetToken(tokenHash:string):StoredPasswordResetToken|undefined
  consumePasswordResetToken(tokenHash:string,usedAt:string):void
  audit(event: AuditEvent): void
  listAudit(userId: string, limit?: number): AuditEvent[]
  close?(): void
}
