export type Role = 'user' | 'assistant' | 'system'
export type Capability = 'chat' | 'reasoning' | 'code' | 'research' | 'vision' | 'creative' | 'planning'

export interface Message {
  id: string
  conversationId: string
  role: Role
  content: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface Conversation {
  id: string
  userId: string
  title: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface Memory {
  id: string
  userId: string
  projectId?: string
  content: string
  kind: 'preference' | 'project' | 'fact' | 'decision' | 'unknown' | 'failure' | 'evidence' | 'procedure' | 'experience'
  importance: number
  createdAt: string
}

export interface FileAsset {
  id: string
  userId: string
  projectId?: string
  name: string
  mimeType: string
  size: number
  checksum: string
  storagePath: string
  createdAt: string
}

export type MissionPhase = 'CREATED'|'ANALYZING'|'PLANNING'|'EXECUTING'|'VERIFYING'|'FAILED'|'RECOVERING'|'REPLANNING'|'COMPLETED'|'PAUSED'|'CANCELLED'
export type AutonomyLevel = 'ASSISTED'|'SUPERVISED'|'SEMI_AUTONOMOUS'|'AUTONOMOUS'
export type FailureCategory = 'INPUT_FAILURE'|'MODEL_FAILURE'|'TOOL_FAILURE'|'NETWORK_FAILURE'|'EXECUTION_FAILURE'|'VALIDATION_FAILURE'|'RESOURCE_FAILURE'|'LOGIC_FAILURE'|'DEPENDENCY_FAILURE'
export interface MissionContract {
  missionId: string
  objective: string
  userIntent: string
  constraints: string[]
  requiredCapabilities: string[]
  availableResources: string[]
  risks: string[]
  successCriteria: string[]
  verificationRequirements: string[]
  finalDeliverable: string
  autonomy: AutonomyLevel
  phase: MissionPhase
  createdAt: string
  updatedAt: string
}

export interface Mission {
  id: string
  userId: string
  projectId?: string
  goal: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  progress: number
  createdAt: string
  updatedAt: string
}

export interface MissionTask {
  id: string
  missionId: string
  key: string
  title: string
  kind: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  dependsOn: string[]
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  progress: number
  attempts: number
  maxAttempts: number
  createdAt: string
  updatedAt: string
}

export interface MissionEvent {
  id: string
  missionId: string
  taskId?: string
  type: string
  payload: Record<string, unknown>
  createdAt: string
}

export interface ProjectCheckpoint {
  id: string
  userId: string
  projectId: string
  label: string
  snapshot: Record<string, unknown>
  createdAt: string
  restoredAt?: string
}

export interface ExternalModel {
  key: string
  source: 'puter'
  id: string
  provider: string
  name?: string
  aliases: string[]
  contextWindow?: number
  maxTokens?: number
  inputCost?: number
  outputCost?: number
  rawMetadata: Record<string, unknown>
  firstSeenAt: string
  lastSeenAt: string
  available: boolean
}

export interface ModelEvaluation {
  id: string
  modelKey: string
  capability: Capability
  score: number
  latencyMs?: number
  success: boolean
  benchmark: string
  createdAt: string
}

export interface ArtifactRecord {
  id:string;userId:string;projectId:string;fileId:string;type:string;version:number;parentId?:string;producer:string;inputs:string[];dependencies:string[];verification:Record<string,unknown>;metadata:Record<string,unknown>;license:string;status:'created'|'verified'|'rejected'|'superseded';createdAt:string
}

export interface DivineEngineCommand {id:string;userId:string;divineProjectId:string;message:string;attachmentFileIds:string[];status:'received'|'planned'|'applied'|'blocked'|'failed';operations:Record<string,unknown>[];createdAt:string;updatedAt:string}
export interface DivineEngineSettings {divineProjectId:string;userId:string;values:Record<string,unknown>;preset:string;version:number;updatedAt:string}

export interface DivineOsProject {
  id:string;userId:string;projectId:string;missionId:string;name:string;variant:'core'|'droid'|'linux'|'win-compat';status:'created'|'configured'|'blocked'|'building'|'verified'|'failed';architecture:string[];baseManifest:Record<string,unknown>;configuration:Record<string,unknown>;compliance:Record<string,unknown>;createdAt:string;updatedAt:string
}
export interface DivineOsModule {id:string;userId:string;divineOsProjectId:string;name:string;version:string;capabilities:string[];dependencies:string[];permissions:string[];status:'declared'|'validated'|'blocked'|'built';manifest:Record<string,unknown>;createdAt:string;updatedAt:string}

export interface DivineProject {
  id:string;userId:string;projectId:string;missionId:string;name:string;brief:string;target:'web'|'desktop'|'mobile'|'unity'|'unreal'|'godot'|'roblox'|'custom';format:'snb-divine-project-v1';executionPolicy:'remote-first'|'hybrid'|'local-first';deviceProfile:Record<string,unknown>;status:'created'|'building'|'blocked'|'completed'|'failed'|'cancelled';createdAt:string;updatedAt:string
}

export interface CapabilityManifest {
  id:string;name:string;version:string;vendor:string;type:'model'|'api'|'sdk'|'plugin'|'library'|'cli'|'software'|'engine'|'service'|'script'|'device';capabilities:string[];inputs:Record<string,unknown>;outputs:Record<string,unknown>;executionMethods:string[];authentication:string[];permissions:string[];dependencies:string[];cost?:Record<string,unknown>;latency?:Record<string,unknown>;limits:Record<string,unknown>;license:string;risk:'low'|'medium'|'high'|'critical';compatibility:string[];status:'discovered'|'testing'|'active'|'unavailable'|'disabled';reliability:number;evidenceCount:number;metadata:Record<string,unknown>;createdAt:string;updatedAt:string
}

export interface EvidenceSource {id:string;userId:string;projectId?:string;url:string;title:string;publisher?:string;publishedAt?:string;retrievedAt:string;contentHash?:string;status:'active'|'stale'|'retracted'}
export interface KnowledgeClaim {id:string;userId:string;projectId?:string;statement:string;state:'KNOWN'|'LIKELY'|'UNCERTAIN'|'UNKNOWN'|'CONFLICTING';confidence:number;createdAt:string;updatedAt:string}
export interface EvidenceLink {id:string;userId:string;claimId:string;sourceId:string;relation:'supports'|'contradicts'|'context';quote?:string;strength:number;createdAt:string}

export interface ApprovalRequest {
  id: string
  userId: string
  missionId?: string
  taskId?: string
  action: string
  risk: 'low' | 'medium' | 'high' | 'critical'
  rationale: string
  status: 'pending' | 'approved' | 'rejected' | 'consumed' | 'expired'
  expiresAt: string
  requestedAt: string
  decidedAt?: string
  consumedAt?: string
}

export interface PuterExecutionReport {
  id: string
  userId: string
  conversationId: string
  modelKey: string
  provider: string
  modelId: string
  promptHash: string
  responseHash: string
  durationMs: number
  fallbackChain: {provider:string;modelId:string;error:string}[]
  trust: 'client-reported'
  receipt: string
  createdAt: string
}

export interface WorkerRecord {
  id: string
  name: string
  capabilities: string[]
  status: 'online' | 'draining' | 'offline'
  lastHeartbeatAt: string
  createdAt: string
}

export interface TaskLease {
  taskId: string
  missionId: string
  workerId: string
  tokenHash: string
  expiresAt: string
  heartbeatAt: string
  createdAt: string
}

export interface ToolExecution {
  id: string
  userId: string
  toolId: string
  toolVersion: string
  missionId?: string
  taskId?: string
  status: 'running' | 'completed' | 'failed' | 'denied'
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  policy: Record<string, unknown>
  verification?: Record<string, unknown>
  receipt?: string
  startedAt: string
  completedAt?: string
}

export interface ModelHealthSample {
  id: string
  modelKey: string
  success: boolean
  latencyMs: number
  error?: string
  source: 'execution' | 'health-probe' | 'benchmark'
  createdAt: string
}

export interface CircuitState {
  resourceKey: string
  state: 'closed' | 'open' | 'half-open'
  failureCount: number
  successCount: number
  openedAt?: string
  cooldownUntil?: string
  lastError?: string
  updatedAt: string
}

export interface BenchmarkCampaign {
  id: string
  userId: string
  capability: Capability
  benchmarkVersion: string
  status: 'running' | 'paused' | 'completed' | 'cancelled'
  totalJobs: number
  submittedJobs: number
  verifiedJobs: number
  failedJobs: number
  createdAt: string
  updatedAt: string
}

export interface BenchmarkJob {
  id: string
  campaignId: string
  modelKey: string
  status: 'pending' | 'claimed' | 'submitted' | 'verified' | 'failed'
  claimTokenHash?: string
  claimExpiresAt?: string
  submittedBy?: string
  output?: Record<string, unknown>
  latencyMs?: number
  error?: string
  createdAt: string
  updatedAt: string
}

export interface ModelDescriptor {
  id: string
  provider: string
  label: string
  capabilities: Capability[]
  tier: 'S++' | 'S+' | 'S' | 'A' | 'UNRANKED'
  available: boolean
  latencyMs?: number
}

export interface ChatRequest {
  userId: string
  conversationId?: string
  projectId?: string
  message: string
  mode: 'auto' | 'fast' | 'deep'
}

export interface ChatResult {
  conversationId: string
  message: Message
  plan: string[]
  model: ModelDescriptor
  confidence: number
  trust: { confidence: number; evidence: { contextItems: number; sourceCount: number }; verification: { status: 'not-verified' | 'verified'; deterministic: boolean } }
  contextItems: number
  durationMs: number
}
