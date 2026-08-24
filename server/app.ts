import Fastify, { type FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import { createReadStream, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { z, ZodError } from 'zod'
import { config, type Config } from './config.js'
import { AppError, UnauthorizedError } from './lib/errors.js'
import { SQLiteStore } from './repositories/sqlite-store.js'
import { MockProvider } from './providers/mock-provider.js'
import { OpenAICompatibleProvider } from './providers/openai-compatible.js'
import { ProviderRegistry } from './providers/registry.js'
import { ContextEngine } from './services/context-engine.js'
import { Orchestrator } from './services/orchestrator.js'
import { AuthService } from './services/auth.js'
import { FileService } from './services/files.js'
import { ModelCatalog } from './services/model-catalog.js'
import { singularitySystems, systemSummary, type SystemStatus } from './services/system-registry.js'
import { MissionEngine } from './services/mission-engine.js'
import { CheckpointService } from './services/checkpoints.js'
import { capabilityDomains, emergingDomains, universalCapabilities } from './services/universal-capabilities.js'
import { UniversalProblemSolver } from './services/problem-solver.js'
import { BenchmarkCampaignService } from './services/benchmark-campaigns.js'
import { benchmarkSuites } from './services/benchmark-suites.js'
import { ToolEcosystem } from './services/tool-ecosystem.js'
import { WorkerCoordinator } from './services/worker-runtime.js'
import { ModelHealthService } from './services/model-health.js'
import { PuterExecutionReports } from './services/puter-executions.js'
import { ApprovalService } from './services/approvals.js'
import { EvidenceEngine } from './services/evidence-engine.js'
import { CodeValidationSandbox } from './services/code-sandbox.js'
import { CapabilityFabric } from './services/capability-fabric.js'
import { DivineEngineService } from './services/divine-engine.js'
import { Procedural3DProvider } from './services/procedural-3d.js'
import { DivineOsService } from './services/divine-os.js'
import { ArtifactGraphService } from './services/artifact-graph.js'
import { ProceduralPbrProvider } from './services/procedural-pbr.js'
import { DivinePrototypePipeline } from './services/divine-prototype-pipeline.js'
import { DivineEngineSettingsService } from './services/divine-engine-settings.js'
import { divineSystemConcepts } from './services/divine-ecosystem-registry.js'
import { Experimental4DService } from './services/experimental-4d.js'
import { integrationMatrix } from './services/integration-matrix.js'
import { v1Gaps } from './services/v1-gap-registry.js'
import { ExternalJobAdapterRegistry } from './services/external-job-adapter.js'
import { ToolFactory } from './services/tool-factory.js'
import { ReleasePackager } from './services/release-packager.js'
import { HsdsService } from './services/hsds.js'
import { UesCoreRuntime } from './services/ues-core-runtime.js'
import { UesAdvancedPipeline } from './services/ues-advanced-pipeline.js'
import { SnbMasterIntelligence } from './services/snb-master-intelligence.js'
import { CognitiveCollaborationService } from './services/cognitive-collaboration.js'
import { UniversalDocumentEngine } from './services/universal-document-engine.js'
import { KnowledgeMemoryService } from './services/knowledge-memory.js'
import { AutomationEngine } from './services/automation/service.js'
import { PluginRuntime } from './services/plugins/service.js'
import { WorkflowControlService } from './services/workflow-control/service.js'
import { OfflineSyncService } from './services/offline-sync/service.js'
import { AutonomousBenchmarkScientist } from './services/benchmark-scientist/service.js'
import { externalValidationGates } from './services/external-validation-gates.js'
import { SelfDiagnosticsService } from './services/self-diagnostics.js'
import { UesMultidimensionalCreation } from './services/ues-2d/service.js'
import { DThesisService } from './services/d-thesis/service.js'
import { RealLifeService } from './services/real-life/service.js'
import { NmnService } from './services/nmn/service.js'
import { AutonomyService } from './services/ues-autonomy/service.js'
import { UesWorldService } from './services/ues-world/service.js'
import { UesNavService } from './services/ues-nav/service.js'
import { UesSocietyService } from './services/ues-society/service.js'
import { UesAudioService } from './services/ues-audio/service.js'
import { UesOptimizeService } from './services/ues-optimize/service.js'
import { UesPhysicsService } from './services/ues-physics/service.js'
import { UesMotionService } from './services/ues-motion/service.js'
import { UesLivingWorldService } from './services/ues-living/service.js'
import { UesCraftService } from './services/ues-craft/service.js'
import { UesVfxService } from './services/ues-vfx/service.js'
import { UesNavmeshService } from './services/ues-navmesh/service.js'
import { UesCityService } from './services/ues-city/service.js'
import { UesReferenceService } from './services/ues-reference/service.js'
import { UesContinuumService } from './services/ues-continuum/service.js'
import { UesCorpusService } from './services/ues-corpus/service.js'
import { UesCriticService } from './services/ues-critic/service.js'
import { UesConstraintsService } from './services/ues-constraints/service.js'
import { UesRegressService } from './services/ues-regress/service.js'
import { UesStreamService } from './services/ues-stream/service.js'
import { UesForgeService } from './services/ues-forge/service.js'
import { UesPlanetService } from './services/ues-planet/service.js'
import { UesFnwsService } from './services/ues-fnws/service.js'
import { UesSynthesisService } from './services/ues-synthesis/service.js'
import { UesTitkoService } from './services/ues-titko/service.js'
import { UesUmotionService } from './services/ues-umotion/service.js'
import { UesEmulationService } from './services/ues-emulation/service.js'
import { UesGisService } from './services/ues-gis/service.js'
import { UesTilesService } from './services/ues-tiles/service.js'
import { UesScaleService } from './services/ues-scale/service.js'
import { UesAstroService } from './services/ues-astro/service.js'
import { UesArticulationService } from './services/ues-articulation/service.js'
import { UesTerrainNavService } from './services/ues-terrain-nav/service.js'
import { UesExplorerService } from './services/ues-explorer/service.js'
import { UesRealisService } from './services/ues-realis/service.js'
import { parsePuterRegistry } from '../scripts/parse-puter-registry.js'

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(10).max(128), name: z.string().min(2).max(80) })
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) })
const refreshSchema = z.object({ refreshToken: z.string().min(32).max(500) })
const passwordResetRequestSchema=z.object({email:z.string().email()})
const passwordResetSchema=z.object({token:z.string().min(32).max(500),password:z.string().min(10).max(128)})
const chatSchema = z.object({ conversationId: z.string().optional(), projectId: z.string().optional(), message: z.string().min(1).max(50_000), mode: z.enum(['auto', 'fast', 'deep']).default('auto') })
const projectSchema = z.object({ name: z.string().min(1).max(120), description: z.string().max(2000).default('') })
const projectUpdateSchema = projectSchema.partial().extend({ status: z.enum(['active', 'archived']).optional() })
const memorySchema = z.object({ content: z.string().min(1).max(10_000), kind: z.enum(['preference','project','fact','decision','unknown','failure','evidence','procedure','experience']), importance: z.number().min(0).max(100).default(50), projectId: z.string().optional() })
const puterModelSchema = z.object({ id: z.string().min(1).max(300), provider: z.string().min(1).max(120), name: z.string().max(300).optional(), aliases: z.array(z.string().max(300)).max(100).optional(), context: z.number().positive().optional(), max_tokens: z.number().positive().optional(), cost: z.object({ input: z.number().nonnegative().optional(), output: z.number().nonnegative().optional() }).passthrough().optional() }).passthrough()
const modelSyncSchema = z.object({ models: z.array(puterModelSchema).min(1).max(2000) })
const capabilitySchema = z.enum(['chat','reasoning','code','research','vision','creative','planning'])
const evaluationSchema = z.object({ modelKey: z.string().min(1).max(600), capability: capabilitySchema, score: z.number().min(0).max(100), benchmark: z.string().min(1).max(200), success: z.boolean(), latencyMs: z.number().int().nonnegative().optional() })
const taskDefinitionSchema = z.object({ key: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80), title: z.string().min(1).max(200), kind: z.string().min(1).max(80), dependsOn: z.array(z.string()).max(50).optional(), input: z.record(z.string(), z.unknown()).optional(), maxAttempts: z.number().int().min(1).max(10).optional() })
const autonomySchema=z.enum(['ASSISTED','SUPERVISED','SEMI_AUTONOMOUS','AUTONOMOUS'])
const failureCategorySchema=z.enum(['INPUT_FAILURE','MODEL_FAILURE','TOOL_FAILURE','NETWORK_FAILURE','EXECUTION_FAILURE','VALIDATION_FAILURE','RESOURCE_FAILURE','LOGIC_FAILURE','DEPENDENCY_FAILURE'])
const missionSchema = z.object({ goal: z.string().min(3).max(5000), projectId: z.string().optional(), userIntent:z.string().max(5000).optional(),constraints:z.array(z.string().max(500)).max(100).optional(),requiredCapabilities:z.array(z.string().max(100)).max(100).optional(),availableResources:z.array(z.string().max(500)).max(100).optional(),risks:z.array(z.string().max(500)).max(100).optional(),successCriteria:z.array(z.string().max(500)).max(100).optional(),verificationRequirements:z.array(z.string().max(500)).max(100).optional(),finalDeliverable:z.string().max(2000).optional(),autonomy:autonomySchema.optional(),tasks: z.array(taskDefinitionSchema).min(1).max(200) })
const taskOutputSchema = z.object({ output: z.record(z.string(), z.unknown()).default({}) })
const taskFailureSchema = z.object({ reason: z.string().min(1).max(2000), retryable: z.boolean().default(false),category:failureCategorySchema.default('EXECUTION_FAILURE') })
const workflowMutationSchema=z.object({reason:z.string().min(3).max(2000),add:z.array(taskDefinitionSchema).max(100).optional(),cancelKeys:z.array(z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80)).max(100).optional()})
const checkpointSchema = z.object({ label: z.string().min(1).max(120) })
const problemSchema = z.object({ problem: z.string().min(5).max(20_000), projectId: z.string().optional(), allowUnverifiedDomain: z.boolean().default(false) })
const benchmarkCampaignSchema = z.object({ capability: capabilitySchema, benchmarkVersion: z.string().regex(/^[a-zA-Z0-9._-]+$/).max(100) })
const benchmarkSubmissionSchema = z.object({ claimToken: z.string().min(32).max(500), output: z.record(z.string(), z.unknown()), latencyMs: z.number().int().min(0).max(3_600_000) })
const benchmarkVerificationSchema = z.object({ score: z.number().min(0).max(100), success: z.boolean(), error: z.string().max(2000).optional() })
const campaignStatusSchema = z.object({ status: z.enum(['running','paused','cancelled']) })
const toolExecutionSchema = z.object({ input: z.record(z.string(),z.unknown()).default({}), missionId: z.string().optional(), taskId: z.string().optional(), approvalId:z.string().optional() })
const approvalRequestSchema=z.object({action:z.string().min(1).max(300),risk:z.enum(['low','medium','high','critical']),rationale:z.string().min(3).max(2000),missionId:z.string().optional(),taskId:z.string().optional(),ttlMinutes:z.number().int().min(1).max(1440).optional()})
const approvalDecisionSchema=z.object({decision:z.enum(['approved','rejected'])})
const settingsSchema=z.object({language:z.enum(['pt-BR','en','es']).optional(),intelligenceMode:z.enum(['auto','fast','deep']).optional(),compact:z.boolean().optional(),proactive:z.boolean().optional(),reducedMotion:z.boolean().optional(),highContrast:z.boolean().optional(),dataRetentionDays:z.number().int().min(1).max(3650).optional()}).strict()
const sourceSchema=z.object({url:z.string().url().max(2000),title:z.string().min(1).max(500),publisher:z.string().max(300).optional(),publishedAt:z.string().datetime().optional(),projectId:z.string().optional(),content:z.string().max(500000).optional()})
const claimSchema=z.object({statement:z.string().min(1).max(10000),state:z.enum(['KNOWN','LIKELY','UNCERTAIN','UNKNOWN','CONFLICTING']).optional(),confidence:z.number().min(0).max(100).optional(),projectId:z.string().optional()})
const evidenceLinkSchema=z.object({claimId:z.string().min(1),sourceId:z.string().min(1),relation:z.enum(['supports','contradicts','context']),quote:z.string().max(10000).optional(),strength:z.number().min(0).max(1)})
const sandboxSchema=z.object({language:z.enum(['javascript','typescript','json']),source:z.string().min(1).max(500000)})
const researchPlanSchema=z.object({query:z.string().min(3).max(20000),modelCount:z.number().int().min(2).max(8).default(4)})
const manifestSchema=z.object({id:z.string().regex(/^[a-z0-9._-]+$/).max(160),name:z.string().min(1).max(300),version:z.string().min(1).max(100),vendor:z.string().min(1).max(200),type:z.enum(['model','api','sdk','plugin','library','cli','software','engine','service','script','device']),capabilities:z.array(z.string().min(1).max(160)).min(1).max(200),inputs:z.record(z.string(),z.unknown()),outputs:z.record(z.string(),z.unknown()),executionMethods:z.array(z.string()).max(50),authentication:z.array(z.string()).max(50),permissions:z.array(z.string()).max(50),dependencies:z.array(z.string()).max(100),cost:z.record(z.string(),z.unknown()).optional(),latency:z.record(z.string(),z.unknown()).optional(),limits:z.record(z.string(),z.unknown()),license:z.string().max(200),risk:z.enum(['low','medium','high','critical']),compatibility:z.array(z.string()).max(100),status:z.enum(['discovered','testing','unavailable','disabled']),metadata:z.record(z.string(),z.unknown())})
const manifestValidationSchema=z.object({license:z.string().min(1).max(200),reliability:z.number().min(0).max(100),evidenceCount:z.number().int().min(0).max(100000),activate:z.boolean()})
const pipeline3dSchema=z.object({goal:z.string().min(3).max(5000)})
const divineProjectSchema=z.object({name:z.string().min(1).max(120),brief:z.string().min(10).max(20000),target:z.enum(['web','desktop','mobile','unity','unreal','godot','roblox','custom']).default('web'),executionPolicy:z.enum(['remote-first','hybrid','local-first']).default('remote-first'),deviceProfile:z.record(z.string(),z.unknown()).default({tier:'balanced'})})
const procedural3dSchema=z.object({prompt:z.string().min(1).max(5000),name:z.string().max(120).optional(),projectId:z.string().optional()})
const divineOsSchema=z.object({name:z.string().min(1).max(120),variant:z.enum(['core','droid','linux','win-compat']),baseManifest:z.record(z.string(),z.unknown()).optional(),configuration:z.record(z.string(),z.unknown()).optional()})
const divineOsModuleSchema=z.object({name:z.string().min(1).max(160),version:z.string().min(1).max(80),capabilities:z.array(z.string().max(160)).max(100),dependencies:z.array(z.string().max(200)).max(200),permissions:z.array(z.string().max(100)).max(100),manifest:z.record(z.string(),z.unknown()).default({})})
const divineOsBaseSchema=z.object({baseManifest:z.record(z.string(),z.unknown())})
const divineOsResourceSchema=z.object({ramMB:z.number().int().min(256).max(1048576),cpuCores:z.number().int().min(1).max(1024),storageMB:z.number().int().min(128),batteryPowered:z.boolean()})
const pbrSchema=z.object({prompt:z.string().min(1).max(5000),projectId:z.string(),name:z.string().max(120).optional(),resolution:z.number().int().min(16).max(256).optional()})
const prototypePipelineSchema=z.object({projectId:z.string(),prompt:z.string().min(1).max(5000),name:z.string().min(1).max(80)})
const hsdsCreateSchema=z.object({divineProjectId:z.string(),device:z.object({viewportWidth:z.number().int().min(1).max(16384),viewportHeight:z.number().int().min(1).max(16384),bandwidthMbps:z.number().positive().max(10000).optional(),latencyMs:z.number().nonnegative().max(60000).optional(),decodeTier:z.enum(['low','balanced','high']).optional(),saveData:z.boolean().optional()})})
const hsdsInputSchema=z.object({type:z.enum(['pointer','keyboard','gamepad','touch']),dx:z.number().min(-100).max(100).optional(),dy:z.number().min(-100).max(100).optional(),zoom:z.number().min(.1).max(10).optional(),key:z.enum(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown']).optional()})
const uesCoreBuildSchema=z.object({projectId:z.string(),name:z.string().min(1).max(120),seed:z.string().min(1).max(500)})
const uesLivingBuildSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(120),seed:z.string().min(1).max(500).default('ues'),size:z.number().int().min(8).max(64).optional(),ticks:z.number().int().min(1).max(24).optional(),action:z.enum(['flee','hide','protect-family','search-missing','aid-wounded','defend','seek-info','continue-routine','loot','freeze','follow-crowd','evacuate-with-family','travel-to-family','help-evacuation']).optional()})
const uesAdvancedBuildSchema=z.object({projectId:z.string(),name:z.string().min(1).max(120),prompt:z.string().min(3).max(5000)})
const masterCompileSchema=z.object({projectId:z.string(),intent:z.string().min(3).max(20000),constraints:z.array(z.string().min(1).max(1000)).max(100).optional(),autonomy:autonomySchema.optional()})
const cognitiveFindingSchema=z.object({code:z.string().min(1).max(120),severity:z.enum(['info','warning','error']),message:z.string().min(1).max(2000)})
const cognitiveHandoffSchema=z.object({missionId:z.string(),taskId:z.string(),modelKey:z.string().min(1).max(600),inputArtifactIds:z.array(z.string()).max(100).default([]),output:z.record(z.string(),z.unknown()),findings:z.array(cognitiveFindingSchema).max(100).default([])})
const cognitiveReviewSchema=z.object({reviewerTaskId:z.string(),reviewerModelKey:z.string().min(1).max(600),verdict:z.enum(['accept','revise','reject']),findings:z.array(cognitiveFindingSchema).max(100).default([])})
const correctionVerificationSchema=z.object({correctedHandoffId:z.string().min(1).max(200)})
const documentCreateSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).min(1).max(120),title:z.string().min(1).max(500),paragraphs:z.array(z.string().max(20000)).max(500),table:z.array(z.array(z.string().max(10000)).max(200)).max(10000).optional(),formats:z.array(z.enum(['pdf','docx','xlsx','pptx','markdown','csv'])).min(1).max(6)})
const knowledgeMemoryCreateSchema=memorySchema.extend({retentionDays:z.number().int().min(1).max(3650).optional(),reason:z.string().min(1).max(1000).optional()})
const knowledgeMemoryReviseSchema=z.object({content:z.string().min(1).max(10000),reason:z.string().min(3).max(1000),retentionDays:z.number().int().min(1).max(3650).optional()})
const knowledgeMemoryInvalidateSchema=z.object({reason:z.string().min(3).max(1000)})
const automationCreateSchema=z.object({projectId:z.string(),name:z.string().min(1).max(120),trigger:z.discriminatedUnion('kind',[z.object({kind:z.literal('schedule'),cron:z.string().min(9).max(100)}),z.object({kind:z.literal('event'),event:z.string().min(1).max(160),filters:z.record(z.string(),z.string()).default({})})]),action:z.object({kind:z.literal('create-mission'),goal:z.string().min(3).max(5000),tasks:z.array(taskDefinitionSchema).min(1).max(100)})})
const pluginManifestSchema=z.object({id:z.string(),name:z.string().min(1).max(200),version:z.string(),capabilities:z.array(z.string()).max(100),permissions:z.array(z.string()).max(100),dependencies:z.array(z.object({id:z.string(),version:z.string()})).max(100),entrypoint:z.string(),license:z.string(),payloadChecksum:z.string()})
const pluginInstallSchema=z.object({projectId:z.string(),manifest:pluginManifestSchema,payloadBase64:z.string().min(1).max(5_000_000)})
const conditionSchema=z.object({path:z.string().min(1).max(160),operator:z.enum(['eq','neq','gt','gte','lt','lte','includes','exists']),value:z.unknown().optional()})
const workflowBranchSchema=z.object({reason:z.string().min(3).max(1000),facts:z.record(z.string(),z.unknown()),condition:conditionSchema,then:z.array(taskDefinitionSchema).max(100),otherwise:z.array(taskDefinitionSchema).max(100)})
const compensationSchema=z.object({reason:z.string().min(3).max(1000),definitions:z.array(z.object({forTask:z.string(),title:z.string(),kind:z.string(),input:z.record(z.string(),z.unknown()).optional()})).min(1).max(100)})
const offlineOperationSchema=z.object({id:z.string().min(1).max(160),deviceId:z.string().min(1).max(160),key:z.string().min(1).max(300),baseRevision:z.number().int().nonnegative(),patch:z.record(z.string(),z.unknown()),createdAt:z.string()})
const offlineSyncSchema=z.object({operations:z.array(offlineOperationSchema).max(1000),strategy:z.enum(['manual','server-wins','client-wins']).default('manual')})
const benchmarkProposalSchema=z.object({projectId:z.string(),capability:capabilitySchema,version:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(100)})
const multidimensionalBuildSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(120),prompt:z.string().min(3).max(5000)})
const dThesisSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(120),context:z.object({objective:z.string().min(3).max(20000),context:z.string().max(10000).optional(),constraints:z.array(z.string()).max(100),resources:z.array(z.string()).max(100),priorities:z.object({quality:z.number().min(0).max(10),performance:z.number().min(0).max(10),safety:z.number().min(0).max(10),cost:z.number().min(0).max(10),scalability:z.number().min(0).max(10)}),maxIterations:z.number().int().min(1).max(8).optional()})})
const realityModeSchema=z.enum(['real-life','cartoon','toon-force','fantasy','sci-fi','stylized','surreal','custom'])
const hardwareTierSchema=z.enum(['low','balanced','high'])
const dThesisComplementSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(120),objective:z.string().min(3).max(20000),context:z.string().max(10000).optional(),constraints:z.array(z.string()).max(100).default([]),resources:z.array(z.string()).max(100).default([]),priorities:z.object({quality:z.number().min(0).max(10),performance:z.number().min(0).max(10),safety:z.number().min(0).max(10),cost:z.number().min(0).max(10),scalability:z.number().min(0).max(10)}).default({quality:8,performance:7,safety:9,cost:5,scalability:7}),mode:realityModeSchema.default('real-life'),hardware:hardwareTierSchema.default('balanced'),phenomenon:z.string().max(5000).optional(),includeWarScenario:z.boolean().default(true)})
const realLifeComposeSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(120),objective:z.string().min(3).max(20000),phenomenon:z.string().max(5000).optional(),mode:realityModeSchema.default('real-life'),domains:z.array(z.string().max(80)).max(40).optional(),hardware:hardwareTierSchema.default('balanced'),sources:z.array(z.object({title:z.string().min(1).max(300),statement:z.string().min(1).max(4000),independent:z.boolean(),tested:z.boolean().optional(),contradicts:z.array(z.string()).max(20).optional()})).max(50).optional(),customLaws:z.record(z.string(),z.unknown()).optional(),perturbation:z.object({node:z.string().min(1).max(40),magnitude:z.number().min(-1).max(1)}).optional()})
const realLifeDomainSchema=z.object({id:z.string().regex(/^[a-z0-9][a-z0-9-]{1,62}$/),name:z.string().min(2).max(120),category:z.enum(['natural-science','human-behavior','engineering','natural-system','artificial-system','custom']),purpose:z.string().min(3).max(500),principles:z.array(z.string().min(2).max(300)).min(1).max(40),relations:z.array(z.string().max(80)).max(40),applicableDs:z.array(z.enum(['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15'])).max(15)})
const nmnWarSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(120)})
const nmnSimulateSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(120),characterIds:z.array(z.string()).max(200).optional(),ticks:z.number().int().min(1).max(12).optional(),event:z.object({id:z.string().min(1).max(80),kind:z.string().min(1).max(80),location:z.string().min(1).max(80),danger:z.number().min(0).max(1),opportunity:z.number().min(0).max(1),medicalNeed:z.number().min(0).max(1),combatNeed:z.number().min(0).max(1),evidence:z.number().min(0).max(1),rumorStrength:z.number().min(0).max(1),authorityPresence:z.number().min(0).max(1),scarcity:z.number().min(0).max(1),dissatisfaction:z.number().min(0).max(1),description:z.string().min(1).max(2000)})})
const autonomyCreateSchema=z.object({projectId:z.string(),name:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(120),intent:z.string().min(3).max(20000),constraints:z.array(z.string().max(1000)).max(100).optional()})
const autonomyControlSchema=z.object({action:z.enum(['pause','continue','alter','reject','approve','review','take-control','return-autonomy']),alteration:z.string().max(2000).optional()})
const autonomyDecideSchema=z.object({answer:z.string().min(1).max(200)})
const autonomyKnowledgeSchema=z.object({claim:z.string().min(3).max(4000),inferred:z.boolean().optional(),sources:z.array(z.object({independent:z.boolean(),tested:z.boolean().optional(),contradicts:z.boolean().optional()})).max(20)})
const divineSettingsUpdateSchema=z.object({changes:z.record(z.string(),z.unknown()),preset:z.string().max(80).optional()})
const divineCommandSchema=z.object({message:z.string().min(1).max(10000),attachmentFileIds:z.array(z.string()).max(20).default([])})
const experimental4dSchema=z.object({projectId:z.string(),name:z.string().min(1).max(100),size:z.number().min(.1).max(10).optional(),projectionDistance:z.number().min(.2).max(100).optional()})
const externalJobSchema=z.object({providerId:z.string().min(1).max(160),capability:z.string().min(1).max(160),projectId:z.string(),payload:z.record(z.string(),z.unknown())})
const toolFactorySchema=z.object({projectId:z.string(),id:z.string().min(1).max(160),name:z.string().min(1).max(200),capability:z.string().min(1).max(160),operations:z.array(z.object({type:z.enum(['pick','rename','constant']),from:z.string().optional(),to:z.string().optional(),key:z.string().optional(),value:z.unknown().optional()})).min(1).max(100),tests:z.array(z.object({input:z.record(z.string(),z.unknown()),expected:z.record(z.string(),z.unknown())})).min(1).max(100)})
const releasePackageSchema=z.object({name:z.string().min(1).max(120),version:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(80),releaseNotes:z.string().max(10000).optional()})
const receiptSchema = z.object({ receipt: z.string().min(32).max(500) })
const workerRegistrationSchema = z.object({ id:z.string().max(120).optional(),name:z.string().min(1).max(120),capabilities:z.array(z.string().min(1).max(100)).min(1).max(100) })
const workerLeaseSchema = z.object({ taskId:z.string().min(1),leaseToken:z.string().min(32).max(500) })
const modelHealthSchema = z.object({ modelKey:z.string().min(1).max(600),success:z.boolean(),latencyMs:z.number().int().min(0).max(3_600_000),source:z.enum(['execution','health-probe','benchmark']),error:z.string().max(2000).optional() })
const puterExecutionSchema=z.object({conversationId:z.string().optional(),prompt:z.string().min(1).max(50_000),response:z.string().min(1).max(200_000),provider:z.string().min(1).max(120),modelId:z.string().min(1).max(300),durationMs:z.number().int().min(0).max(3_600_000),startedAt:z.string().datetime(),fallbackChain:z.array(z.object({provider:z.string().min(1).max(120),modelId:z.string().min(1).max(300),error:z.string().max(2000)})).max(8).default([])})

export async function buildApp(overrides: Partial<Config> = {}) {
  const appConfig = { ...config, ...overrides }
  if(appConfig.NODE_ENV==='test'&&!overrides.MODEL_SYNC_SECRET)appConfig.MODEL_SYNC_SECRET='development-model-sync-secret-change-me'
  const app = Fastify({ logger: appConfig.NODE_ENV === 'test' ? false : { level: appConfig.LOG_LEVEL }, bodyLimit: 2 * 1024 * 1024, requestTimeout: 130_000 })
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, { origin: appConfig.CORS_ORIGIN === '*' ? true : appConfig.CORS_ORIGIN.split(',').map(value => value.trim()), credentials: appConfig.CORS_ORIGIN !== '*' })
  await app.register(rateLimit, { max: 120, timeWindow: '1 minute' })
  await app.register(multipart, { limits: { fileSize: appConfig.MAX_UPLOAD_BYTES, files: 1, fields: 4 } })

  const databasePath = appConfig.NODE_ENV === 'test' ? ':memory:' : resolve(appConfig.DATABASE_PATH)
  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true })
  const store = new SQLiteStore(databasePath)
  const registry = new ProviderRegistry()
  if(appConfig.NODE_ENV!=='production')registry.register(new MockProvider())
  if (appConfig.AI_BASE_URL && appConfig.AI_API_KEY) registry.register(new OpenAICompatibleProvider(appConfig.AI_BASE_URL, appConfig.AI_API_KEY, appConfig.AI_MODEL))
  const auth = new AuthService(appConfig.JWT_SECRET, store)
  const context = new ContextEngine(store)
  const orchestrator = new Orchestrator(store, registry, context)
  const files = new FileService(store, resolve('./data/uploads'), appConfig.MAX_UPLOAD_BYTES)
  const modelCatalog = new ModelCatalog(store)
  if(appConfig.NODE_ENV!=='test'&&modelCatalog.summary().total===0){const snapshotPath=resolve('./puter-models.txt');if(existsSync(snapshotPath))modelCatalog.syncPuter(parsePuterRegistry(readFileSync(snapshotPath,'utf8')).models)}
  const missions = new MissionEngine(store)
  const checkpoints = new CheckpointService(store)
  const problemSolver = new UniversalProblemSolver(modelCatalog)
  const benchmarkCampaigns = new BenchmarkCampaignService(store, modelCatalog)
  const approvals=new ApprovalService(store)
  const evidence=new EvidenceEngine(store)
  const sandbox=new CodeValidationSandbox()
  const capabilityFabric=new CapabilityFabric(store)
  if(appConfig.NODE_ENV!=='test')await capabilityFabric.discoverEnvironment()
  const procedural3d=new Procedural3DProvider(store)
  const artifactGraph=new ArtifactGraphService(store)
  const externalProviders=new ExternalJobAdapterRegistry(store,artifactGraph,appConfig.EXTERNAL_PROVIDER_CONFIG)
  await externalProviders.load()
  const toolFactory=new ToolFactory(store,artifactGraph,capabilityFabric,sandbox)
  const releasePackager=new ReleasePackager(store,artifactGraph)
  const experimental4d=new Experimental4DService(store,artifactGraph)
  const proceduralPbr=new ProceduralPbrProvider(store)
  const prototypePipeline=new DivinePrototypePipeline(store,artifactGraph,procedural3d,proceduralPbr)
  const divineSettings=new DivineEngineSettingsService(store)
  const hsds=new HsdsService(store)
  const uesCore=new UesCoreRuntime(store,artifactGraph)
  const uesAdvanced=new UesAdvancedPipeline(store,artifactGraph)
  const uesMultidimensional=new UesMultidimensionalCreation(store,artifactGraph)
  const dThesis=new DThesisService(store,artifactGraph)
  const realLife=new RealLifeService(store,artifactGraph)
  const nmn=new NmnService(store,artifactGraph)
  const uesAutonomy=new AutonomyService(store,artifactGraph)
  const uesWorld=new UesWorldService(store,artifactGraph)
  const uesNav=new UesNavService(store,artifactGraph)
  const uesSociety=new UesSocietyService(store,artifactGraph)
  const uesAudio=new UesAudioService(store,artifactGraph)
  const uesOptimize=new UesOptimizeService(store,artifactGraph)
  const uesPhysicsCcd=new UesPhysicsService(store,artifactGraph)
  const uesMotion=new UesMotionService(store,artifactGraph)
  const uesLiving=new UesLivingWorldService(store,artifactGraph)
  const uesCraft=new UesCraftService(store,artifactGraph)
  const uesVfx=new UesVfxService(store,artifactGraph)
  const uesNavmesh=new UesNavmeshService(store,artifactGraph)
  const uesCity=new UesCityService(store,artifactGraph)
  const uesReference=new UesReferenceService(store,artifactGraph)
  const uesContinuum=new UesContinuumService(store,artifactGraph)
  const uesCorpus=new UesCorpusService(store,artifactGraph)
  const uesCritic=new UesCriticService(store,artifactGraph)
  const uesConstraints=new UesConstraintsService(store,artifactGraph)
  const uesRegress=new UesRegressService(store,artifactGraph)
  const uesStream=new UesStreamService(store,artifactGraph)
  const uesForge=new UesForgeService(store,artifactGraph)
  const uesPlanet=new UesPlanetService(store,artifactGraph)
  const uesFnws=new UesFnwsService(store,artifactGraph)
  const uesSynthesis=new UesSynthesisService(store,artifactGraph)
  const uesTitko=new UesTitkoService(store,artifactGraph)
  const uesUmotion=new UesUmotionService(store,artifactGraph)
  const uesEmulation=new UesEmulationService(store,artifactGraph)
  const uesGis=new UesGisService(store,artifactGraph)
  const uesTiles=new UesTilesService(store,artifactGraph)
  const uesScale=new UesScaleService(store,artifactGraph)
  const uesAstro=new UesAstroService(store,artifactGraph)
  const uesArticulation=new UesArticulationService(store,artifactGraph)
  const uesTerrainNav=new UesTerrainNavService(store,artifactGraph)
  const uesExplorer=new UesExplorerService(store,artifactGraph)
  const uesRealis=new UesRealisService(store,artifactGraph)
  const masterIntelligence=new SnbMasterIntelligence(store,missions,problemSolver,context,artifactGraph)
  const cognitiveCollaboration=new CognitiveCollaborationService(store,missions,appConfig.EXECUTION_RECEIPT_SECRET)
  const documentEngine=new UniversalDocumentEngine(store,artifactGraph)
  const knowledgeMemory=new KnowledgeMemoryService(store)
  const automationEngine=new AutomationEngine(store,missions,appConfig.EXECUTION_RECEIPT_SECRET)
  const pluginRuntime=new PluginRuntime(store,appConfig.EXECUTION_RECEIPT_SECRET)
  const workflowControl=new WorkflowControlService(store,missions)
  const offlineSync=new OfflineSyncService(appConfig.EXECUTION_RECEIPT_SECRET)
  const benchmarkScientist=new AutonomousBenchmarkScientist(store,artifactGraph)
  capabilityFabric.registerInternalVerified({id:'snb.procedural-3d',name:'SNB Procedural 3D Fallback',version:'1.0.0',capabilities:['3d.generate','3d.uv','material.pbr','animation.motion','3d.export','verify.3d'],outputs:{artifact:'GLB',mesh:'24 vertices / 12 triangles',animation:'turntable'},verifier:'glb-structural-v1'})
  capabilityFabric.registerInternalVerified({id:'snb.procedural-pbr',name:'SNB Procedural PBR',version:'1.0.0',capabilities:['texture.generate','material.pbr','texture.optimize','verify.texture'],outputs:{maps:['albedo','normal','roughness','metallic','ao','height'],material:'JSON'},verifier:'png-and-mapset-v1'})
  capabilityFabric.registerInternalVerified({id:'snb.scene-builder',name:'SNB Scene Builder',version:'1.0.0',capabilities:['scene.build','artifact.integrate'],outputs:{scene:'snb-scene-v1'},verifier:'scene-dependency-v1'})
  capabilityFabric.registerInternalVerified({id:'snb.webgl-prototype',name:'SNB WebGL Prototype Builder',version:'1.0.0',capabilities:['gameplay.prototype','game.build.web','build.verify'],outputs:{build:'self-contained HTML'},verifier:'html-offline-v1'})
  capabilityFabric.registerInternalVerified({id:'snb.experimental-4d',name:'SNB Experimental 4D Runtime',version:'1.0.0',capabilities:['math.4d','geometry.4d','projection.4d-3d','visualization.4d'],outputs:{geometry:'snb-4d-geometry-v1',build:'offline HTML canvas'},verifier:'tesseract-topology-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.core-runtime',name:'UES Owned Core Runtime',version:'1.1.0',capabilities:['world.generate','physics.simulate','3d.retopology','rig.character','animation.motion','audio.synthesize','vfx.simulate','3d.optimize'],outputs:{artifact:'runtime.ues-core'},verifier:'ues-core-multisystem-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.advanced-pipeline',name:'UES Advanced Internal Pipeline',version:'1.0.0',capabilities:['3d.semantic','3d.generate','physics.broadphase','physics.raycast','animation.ik','animation.fk','animation.retarget','3d.lod','quality.critics'],outputs:{artifact:'production.ues-advanced'},verifier:'ues-advanced-production-v1'})
  capabilityFabric.registerInternalVerified({id:'snb.document-engine',name:'SNB Universal Document Engine',version:'1.0.0',capabilities:['document.pdf','document.docx','document.xlsx','document.pptx','document.markdown','document.csv'],outputs:{artifacts:['PDF','DOCX','XLSX','PPTX','Markdown','CSV']},verifier:'document-structural-v1'})
  capabilityFabric.registerInternalVerified({id:'snb.automation-engine',name:'SNB Automation Engine',version:'1.0.0',capabilities:['automation.cron','automation.event','mission.trigger'],outputs:{mission:'supervised persistent DAG',receipt:'HMAC'},verifier:'automation-policy-v1'})
  capabilityFabric.registerInternalVerified({id:'snb.plugin-package-runtime',name:'SNB Plugin Package Runtime',version:'1.0.0',capabilities:['plugin.install','plugin.lifecycle','plugin.dependencies','plugin.verify'],outputs:{state:'installed/enabled/disabled',receipt:'HMAC'},verifier:'plugin-package-policy-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.multidimensional-creation',name:'UES Multidimensional Creation',version:'1.0.0',capabilities:['2d.generate','2.5d.compose','3.5d.experimental','runtime.parallax'],outputs:{artifacts:['SVG','HTML','JSON']},verifier:'ues-multidimensional-v1'})
  capabilityFabric.registerInternalVerified({id:'snb-ues.d-thesis',name:'SNB/UES D Thesis',version:'1.1.0',capabilities:['reasoning.d-matrix','optimization.do15','planning.perfect-points','analysis.gpp','reality.universal','npc.nmn','development.autonomy'],outputs:{artifact:'analysis.d-thesis'},verifier:'d-thesis-contextual-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.real-life-universal',name:'UES Real-Life Universal',version:'1.0.0',capabilities:['reality.domains','reality.modes','environment.graph','perceptual.equivalence','hardware.adaptation'],outputs:{artifact:'model.real-life-universal'},verifier:'real-life-universal-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.nmn',name:'UES Natural Mindset of NPCs',version:'1.0.0',capabilities:['npc.identity','npc.perception','npc.decision','npc.fidelity'],outputs:{artifact:'simulation.nmn'},verifier:'nmn-contextual-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.semantic-world',name:'UES Semantic World',version:'1.0.0',capabilities:['world.roads','world.settlements','world.vegetation','world.streaming'],outputs:{artifact:'world.ues-semantic'},verifier:'ues-semantic-world-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.navigation',name:'UES Navigation',version:'1.0.0',capabilities:['nav.grid','nav.astar','nav.avoidance','nav.nmn-intent'],outputs:{artifact:'runtime.ues-nav'},verifier:'ues-nav-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.society',name:'UES Society Sample',version:'1.0.0',capabilities:['society.economy','society.population','npc.fidelity'],outputs:{artifact:'simulation.ues-society'},verifier:'ues-society-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.audio-mixer',name:'UES Audio Mixer',version:'1.0.0',capabilities:['audio.mix','audio.spatial','audio.loudness'],outputs:{artifact:'audio.ues-mix'},verifier:'ues-audio-mix-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.optimizer',name:'UES Measured D-O15 Loop',version:'1.0.0',capabilities:['profile.cpu','optimize.perceptual','optimize.rollback'],outputs:{artifact:'analysis.ues-optimize'},verifier:'ues-optimize-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.living-world',name:'UES Living World',version:'1.0.0',capabilities:['world.generate','nav.grid','society.population','audio.mix','profile.cpu'],outputs:{artifact:'runtime.ues-living-world'},verifier:'ues-living-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.craft',name:'UES Craft Pipeline',version:'1.0.0',capabilities:['3d.retopology','rig.anatomy','net.authority','image.reconstruct','animation.frameflow'],outputs:{artifact:'production.ues-craft'},verifier:'ues-craft-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.continuum',name:'UES Continuum Pipeline',version:'1.0.0',capabilities:['physics.gjk','vfx.fluid','nav.mesh','society.census','reference.constraints','audio.spatial','animation.match'],outputs:{artifact:'production.ues-continuum'},verifier:'ues-continuum-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.forge',name:'UES Forge Pipeline',version:'1.0.0',capabilities:['3d.corpus','quality.critics','physics.constraints','image.regress','world.stream'],outputs:{artifact:'production.ues-forge'},verifier:'ues-forge-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.emulation',name:'UES World Emulation',version:'1.0.0',capabilities:['world.planet','world.hydro','world.synthesize','material.titko','animation.umotion','water.fnws'],outputs:{artifact:'production.ues-emulation'},verifier:'ues-emulation-v1'})
  capabilityFabric.registerInternalVerified({id:'ues.realis',name:'UES Realis Data Chain',version:'1.0.0',capabilities:['world.gis','tiles.hlod','world.scale','material.pbr','animation.apply','nav.terrain','physics.ik'],outputs:{artifact:'production.ues-realis'},verifier:'ues-realis-v1'})
  const divineEngine=new DivineEngineService(store,missions,capabilityFabric,procedural3d)
  const divineOs=new DivineOsService(store,missions,capabilityFabric)
  const tools = new ToolEcosystem(store, appConfig.EXECUTION_RECEIPT_SECRET, appConfig.PHYSICAL_EXECUTION_ENABLED,approvals)
  const workers = new WorkerCoordinator(store, appConfig.WORKER_LEASE_SECONDS)
  const selfDiagnostics=new SelfDiagnosticsService(store,workers,appConfig.EXECUTION_RECEIPT_SECRET)
  const modelHealth = new ModelHealthService(store)
  const puterReports = new PuterExecutionReports(store,appConfig.EXECUTION_RECEIPT_SECRET)
  app.addHook('onClose', async () => store.close())

  app.decorateRequest('userId', '')
  const authenticated = async (request: FastifyRequest) => {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError()
    request.userId = await auth.verify(header.slice(7))
  }
  const modelSyncAuthorized = async (request: FastifyRequest) => {
    const supplied = String(request.headers['x-model-sync-secret'] ?? '')
    const expected = appConfig.MODEL_SYNC_SECRET
    if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) throw new UnauthorizedError('Sincronização de catálogo não autorizada.')
  }
  const workerAuthorized = async (request: FastifyRequest) => {
    const supplied=String(request.headers['x-worker-secret']??''),expected=appConfig.WORKER_SECRET
    if(supplied.length!==expected.length||!timingSafeEqual(Buffer.from(supplied),Buffer.from(expected)))throw new UnauthorizedError('Worker não autorizado.')
  }

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: error.flatten() } })
    if (error instanceof AppError) return reply.status(error.statusCode).send({ error: { code: error.code, message: error.message, details: error.details } })
    app.log.error(error)
    return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno inesperado.' } })
  })

  app.get('/', async () => ({ name: 'Singularity API', company: 'Bunker Studios', status: 'online', health: '/api/health', version: '0.1.0' }))
  app.get('/api/health', async () => ({ status: 'ok', service: 'singularity-api', version: '0.1.0', timestamp: new Date().toISOString() }))
  app.get('/api/v1/system/status', async () => ({ core: 'online', providers: registry.listModels().length, models: registry.listModels(), capabilities: ['chat','reasoning','code','research','vision','creative','planning'], uptime: process.uptime() }))

  app.post('/api/v1/auth/guest', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async () => auth.guest())
  app.post('/api/v1/auth/register', { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } }, async request => auth.register(...(() => { const value = registerSchema.parse(request.body); return [value.email, value.password, value.name] as const })()))
  app.post('/api/v1/auth/login', { config: { rateLimit: { max: 12, timeWindow: '1 minute' } } }, async request => { const value = loginSchema.parse(request.body); return auth.login(value.email, value.password) })
  app.post('/api/v1/auth/refresh', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async request => auth.refresh(refreshSchema.parse(request.body).refreshToken))
  app.post('/api/v1/auth/logout', async (request, reply) => { auth.logout(refreshSchema.parse(request.body).refreshToken); return reply.status(204).send() })
  app.post('/api/v1/auth/password-reset/request',{config:{rateLimit:{max:5,timeWindow:'15 minutes'}}},async request=>auth.requestPasswordReset(passwordResetRequestSchema.parse(request.body).email,appConfig.NODE_ENV!=='production'))
  app.post('/api/v1/auth/password-reset/confirm',{config:{rateLimit:{max:10,timeWindow:'15 minutes'}}},async request=>{const value=passwordResetSchema.parse(request.body);return auth.resetPassword(value.token,value.password)})
  app.post('/api/v1/auth/logout-all', { preHandler: authenticated }, async (request, reply) => { auth.logoutAll(request.userId); return reply.status(204).send() })
  app.get('/api/v1/auth/me',{preHandler:authenticated},async request=>{const user=store.findUserById(request.userId);return user?{user:{id:user.id,email:user.email,name:user.name,guest:false,createdAt:user.createdAt}}:{user:{id:request.userId,name:'Guest Workspace',guest:true}}})

  app.get('/api/v1/dashboard', {preHandler:authenticated}, async request=>({user:{id:request.userId,guest:request.userId.startsWith('guest_')},counts:{projects:store.listProjects(request.userId).length,conversations:store.listConversations(request.userId).length,memories:store.listMemories(request.userId).length,files:store.listFiles(request.userId).length,missions:store.listMissions(request.userId).length,auditEvents:store.listAudit(request.userId,200).length},core:{status:'online',uptime:process.uptime(),physicalExecutionEnabled:appConfig.PHYSICAL_EXECUTION_ENABLED},puter:modelCatalog.summary(),workers:{total:workers.list().length,online:workers.list().filter(worker=>worker.status==='online').length}}))
  app.get('/api/v1/self-diagnostics',{preHandler:authenticated},async request=>selfDiagnostics.inspect(request.userId))
  app.post('/api/v1/self-diagnostics/repair',{preHandler:authenticated},async request=>selfDiagnostics.repair(request.userId))
  app.get('/api/v1/observability',{preHandler:authenticated},async request=>{const missions=store.listMissions(request.userId),toolRuns=store.listToolExecutions(request.userId,200),artifacts=store.listArtifacts(request.userId),workersList=workers.list();return{generatedAt:new Date().toISOString(),missions:{total:missions.length,byStatus:Object.fromEntries(['pending','running','paused','completed','failed','cancelled'].map(status=>[status,missions.filter(item=>item.status===status).length]))},tools:{total:toolRuns.length,failed:toolRuns.filter(item=>item.status==='failed').length,denied:toolRuns.filter(item=>item.status==='denied').length},artifacts:{total:artifacts.length,verified:artifacts.filter(item=>item.status==='verified').length,rejected:artifacts.filter(item=>item.status==='rejected').length},workers:{total:workersList.length,online:workersList.filter(item=>item.status==='online').length},providers:{models:modelCatalog.summary(),external:externalProviders.list()},audit:store.listAudit(request.userId,50)}})
  app.get('/api/v1/beta/readiness',{preHandler:authenticated},async()=>{const catalog=modelCatalog.summary(),workerList=workers.list(),checks=[{id:'core',status:'pass',detail:'API online'},{id:'catalog',status:catalog.total===879?'pass':'fail',detail:`${catalog.total}/879 modelos canônicos`},{id:'worker',status:workerList.some(worker=>worker.status==='online'&&Date.now()-new Date(worker.lastHeartbeatAt).getTime()<60000)?'pass':'warn',detail:`${workerList.length} workers registrados`},{id:'physical-gate',status:!appConfig.PHYSICAL_EXECUTION_ENABLED?'pass':'warn',detail:`physical=${appConfig.PHYSICAL_EXECUTION_ENABLED}`},{id:'jwt-secret',status:appConfig.JWT_SECRET.startsWith('development-')?'warn':'pass',detail:appConfig.JWT_SECRET.startsWith('development-')?'Trocar antes de exposição pública':'Custom secret'},{id:'receipt-secret',status:appConfig.EXECUTION_RECEIPT_SECRET.startsWith('development-')?'warn':'pass',detail:appConfig.EXECUTION_RECEIPT_SECRET.startsWith('development-')?'Trocar antes de exposição pública':'Custom secret'},{id:'https',status:appConfig.PUBLIC_BASE_URL.startsWith('https://')?'pass':'warn',detail:appConfig.PUBLIC_BASE_URL}];return{status:checks.some(check=>check.status==='fail')?'blocked':checks.some(check=>check.status==='warn')?'local-beta':'release-candidate',checks,generatedAt:new Date().toISOString()}})
  app.get('/api/v1/settings',{preHandler:authenticated},async request=>({data:store.getUserSettings(request.userId)}))
  app.patch('/api/v1/settings',{preHandler:authenticated},async request=>{const settings={...store.getUserSettings(request.userId),...settingsSchema.parse(request.body)},updatedAt=new Date().toISOString();store.upsertUserSettings(request.userId,settings,updatedAt);store.audit({id:`audit_${randomUUID().replaceAll('-','')}`,userId:request.userId,action:'settings.updated',resource:'user-settings',createdAt:updatedAt});return{data:settings,updatedAt}})
  app.get('/api/v1/data-export',{preHandler:authenticated},async request=>{const conversations=store.listConversations(request.userId);return{exportedAt:new Date().toISOString(),userId:request.userId,settings:store.getUserSettings(request.userId),projects:store.listProjects(request.userId),conversations:conversations.map(conversation=>({...conversation,messages:store.listMessages(conversation.id,request.userId)})),memories:store.listMemories(request.userId),files:store.listFiles(request.userId).map(({storagePath:_,...file})=>file),missions:store.listMissions(request.userId).map(mission=>({mission,contract:store.getMissionContract(mission.id),tasks:store.listMissionTasks(mission.id),events:store.listMissionEvents(mission.id)})),approvals:store.listApprovals(request.userId),evidence:evidence.graph(request.userId),audit:store.listAudit(request.userId,200)}})
  app.get('/api/v1/models', { preHandler: authenticated }, async () => ({ data: registry.listModels(), puter: modelCatalog.summary() }))
  app.get('/api/v1/models/puter', { preHandler: authenticated }, async request => { const query = request.query as { provider?: string; available?: string; limit?: string; offset?: string }; return { data: modelCatalog.list({ provider: query.provider, available: query.available === undefined ? true : query.available === 'true', limit: Number(query.limit ?? 100), offset: Number(query.offset ?? 0) }), summary: modelCatalog.summary() } })
  app.get('/api/v1/models/puter/coverage', { preHandler: authenticated }, async () => ({ data: ['chat','reasoning','code','research','vision','creative','planning'].map(value => { const coverage=modelCatalog.benchmarkEligibility(capabilitySchema.parse(value));return { capability:value,totalCatalog:coverage.totalCatalog,eligible:coverage.eligible.length,catalogContractEligible:coverage.catalogContractEligible,missingMetadata:coverage.missingMetadata.length,excludedByExplicitModality:coverage.excludedByExplicitModality } }) }))
  app.get('/api/v1/models/puter/route/:capability', { preHandler: authenticated }, async request => modelCatalog.route(capabilitySchema.parse((request.params as { capability: string }).capability)))
  app.post('/api/v1/admin/models/puter/sync', { preHandler: modelSyncAuthorized, config: { rateLimit: { max: 4, timeWindow: '1 minute' } } }, async request => modelCatalog.syncPuter(modelSyncSchema.parse(request.body).models))
  app.post('/api/v1/admin/models/evaluations', { preHandler: modelSyncAuthorized }, async request => { const value = evaluationSchema.parse(request.body); return modelCatalog.recordEvaluation(value.modelKey, value.capability, value.score, value.benchmark, value.success, value.latencyMs) })
  app.post('/api/v1/admin/models/health', { preHandler:modelSyncAuthorized }, async request=>{const value=modelHealthSchema.parse(request.body);return modelHealth.record(value.modelKey,value.success,value.latencyMs,value.source,value.error)})
  app.get('/api/v1/models/puter/health', { preHandler:authenticated }, async request=>modelHealth.summary(z.string().min(1).parse((request.query as {modelKey?:string}).modelKey)))
  app.get('/api/v1/benchmarks/suites', { preHandler: authenticated }, async () => ({ data: benchmarkSuites }))
  app.post('/api/v1/benchmarks/proposals',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await benchmarkScientist.propose(request.userId,benchmarkProposalSchema.parse(request.body))))
  app.get('/api/v1/benchmarks/campaigns', { preHandler: authenticated }, async request => ({ data: benchmarkCampaigns.list(request.userId) }))
  app.post('/api/v1/benchmarks/campaigns', { preHandler: authenticated }, async (request,reply) => { const value=benchmarkCampaignSchema.parse(request.body);return reply.status(201).send(benchmarkCampaigns.create(request.userId,value.capability,value.benchmarkVersion)) })
  app.get('/api/v1/benchmarks/campaigns/:id', { preHandler: authenticated }, async request => { const query=request.query as {status?: 'pending'|'claimed'|'submitted'|'verified'|'failed';limit?:string;offset?:string};return benchmarkCampaigns.detail(request.userId,(request.params as {id:string}).id,query.status,Number(query.limit??100),Number(query.offset??0)) })
  app.patch('/api/v1/benchmarks/campaigns/:id', { preHandler: authenticated }, async request => benchmarkCampaigns.setStatus(request.userId,(request.params as {id:string}).id,campaignStatusSchema.parse(request.body).status))
  app.post('/api/v1/benchmarks/campaigns/:id/claim', { preHandler: authenticated }, async request => benchmarkCampaigns.claim(request.userId,(request.params as {id:string}).id))
  app.post('/api/v1/benchmarks/jobs/:id/submit', { preHandler: authenticated }, async request => { const value=benchmarkSubmissionSchema.parse(request.body);return benchmarkCampaigns.submit(request.userId,(request.params as {id:string}).id,value.claimToken,value.output,value.latencyMs) })
  app.post('/api/v1/admin/benchmarks/jobs/:id/verify', { preHandler: modelSyncAuthorized }, async request => { const value=benchmarkVerificationSchema.parse(request.body);return benchmarkCampaigns.verify((request.params as {id:string}).id,value.score,value.success,value.error) })
  app.get('/api/v1/puter/executions', {preHandler:authenticated},async request=>({data:puterReports.list(request.userId,Number((request.query as {limit?:string}).limit??100))}))
  app.post('/api/v1/puter/executions', {preHandler:authenticated,config:{rateLimit:{max:30,timeWindow:'1 minute'}}},async request=>puterReports.record(request.userId,puterExecutionSchema.parse(request.body)))
  app.post('/api/v1/chat', { preHandler: authenticated, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async request => orchestrator.chat({ ...chatSchema.parse(request.body), userId: request.userId }))
  app.post('/api/v1/chat/stream', { preHandler: authenticated, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const value = chatSchema.parse(request.body)
    reply.hijack(); reply.raw.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive', 'x-accel-buffering': 'no' })
    const event = (type: string, data: unknown) => reply.raw.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)
    try {
      event('status', { step: 'routing', message: 'Selecionando especialistas' })
      const result = await orchestrator.chat({ ...value, userId: request.userId })
      event('status', { step: 'generating', message: 'Sintetizando resposta' })
      for (const chunk of result.message.content.match(/.{1,80}(?:\s|$)/g) ?? [result.message.content]) event('delta', { content: chunk })
      event('done', { ...result, message: { ...result.message, content: '' } })
    } catch (error) { event('error', { message: error instanceof Error ? error.message : 'Falha na execução' }) }
    reply.raw.end()
  })
  app.get('/api/v1/conversations', { preHandler: authenticated }, async request => ({ data: store.listConversations(request.userId) }))
  app.get('/api/v1/conversations/:id/messages', { preHandler: authenticated }, async request => ({ data: store.listMessages((request.params as { id: string }).id, request.userId) }))

  app.get('/api/v1/projects', { preHandler: authenticated }, async request => ({ data: store.listProjects(request.userId) }))
  app.post('/api/v1/projects', { preHandler: authenticated }, async (request, reply) => { const value = projectSchema.parse(request.body); return reply.status(201).send(store.createProject(request.userId, value.name, value.description)) })
  app.patch('/api/v1/projects/:id', { preHandler: authenticated }, async request => store.updateProject((request.params as { id: string }).id, request.userId, projectUpdateSchema.parse(request.body)))
  app.post('/api/v1/projects/:id/checkpoints', { preHandler: authenticated }, async (request, reply) => { const checkpoint = checkpoints.create(request.userId, (request.params as { id: string }).id, checkpointSchema.parse(request.body).label); return reply.status(201).send(checkpoint) })
  app.get('/api/v1/projects/:id/checkpoints', { preHandler: authenticated }, async request => ({ data: checkpoints.list(request.userId, (request.params as { id: string }).id) }))
  app.post('/api/v1/checkpoints/:id/restore', { preHandler: authenticated }, async request => checkpoints.restore(request.userId, (request.params as { id: string }).id))

  app.get('/api/v1/missions', { preHandler: authenticated }, async request => ({ data: missions.list(request.userId) }))
  app.post('/api/v1/missions', { preHandler: authenticated }, async (request, reply) => { const value = missionSchema.parse(request.body); const{tasks,goal,projectId,...contract}=value;return reply.status(201).send(missions.create(request.userId,goal,tasks,projectId,contract)) })
  app.get('/api/v1/missions/:id', { preHandler: authenticated }, async request => missions.detail(request.userId, (request.params as { id: string }).id))
  app.post('/api/v1/missions/:id/mutate',{preHandler:authenticated,config:{rateLimit:{max:30,timeWindow:'1 minute'}}},async request=>missions.mutate(request.userId,(request.params as {id:string}).id,workflowMutationSchema.parse(request.body)))
  app.post('/api/v1/missions/:id/cancel', { preHandler: authenticated }, async request => missions.cancel(request.userId, (request.params as { id: string }).id))
  app.post('/api/v1/missions/:id/pause', { preHandler: authenticated }, async request => missions.pause(request.userId,(request.params as {id:string}).id))
  app.post('/api/v1/missions/:id/resume', { preHandler: authenticated }, async request => missions.resume(request.userId,(request.params as {id:string}).id))
  app.post('/api/v1/missions/:id/tasks/:taskId/start', { preHandler: authenticated }, async request => { const params = request.params as { id: string; taskId: string }; return missions.startTask(request.userId, params.id, params.taskId) })
  app.post('/api/v1/missions/:id/tasks/:taskId/complete', { preHandler: authenticated }, async request => { const params = request.params as { id: string; taskId: string }; return missions.completeTask(request.userId, params.id, params.taskId, taskOutputSchema.parse(request.body).output) })
  app.post('/api/v1/missions/:id/tasks/:taskId/fail', { preHandler: authenticated }, async request => { const params = request.params as { id: string; taskId: string }; const value = taskFailureSchema.parse(request.body); return missions.failTask(request.userId, params.id, params.taskId, value.reason, value.retryable,value.category) })
  app.get('/api/v1/missions/:id/events', { preHandler: authenticated }, async request => { const missionId = (request.params as { id: string }).id; store.getMission(missionId, request.userId); return { data: store.listMissionEvents(missionId, (request.query as { after?: string }).after) } })

  app.post('/api/v1/research/plan',{preHandler:authenticated,config:{rateLimit:{max:10,timeWindow:'1 minute'}}},async request=>{const value=researchPlanSchema.parse(request.body);return modelCatalog.webSearchPlan(value.query,value.modelCount)})
  app.get('/api/v1/evidence-graph',{preHandler:authenticated},async request=>evidence.graph(request.userId,(request.query as {projectId?:string}).projectId))
  app.post('/api/v1/evidence/sources',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(evidence.addSource(request.userId,sourceSchema.parse(request.body))))
  app.post('/api/v1/evidence/claims',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(evidence.addClaim(request.userId,claimSchema.parse(request.body))))
  app.post('/api/v1/evidence/links',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(evidence.link(request.userId,evidenceLinkSchema.parse(request.body))))

  app.get('/api/v1/memories', { preHandler: authenticated }, async request => ({ data: store.listMemories(request.userId, (request.query as { projectId?: string }).projectId) }))
  app.post('/api/v1/memories', { preHandler: authenticated }, async (request, reply) => { const value = memorySchema.parse(request.body); return reply.status(201).send(store.createMemory(request.userId, value.content, value.kind, value.importance, value.projectId)) })
  app.delete('/api/v1/memories/:id', { preHandler: authenticated }, async (request, reply) => { store.deleteMemory((request.params as { id: string }).id, request.userId); return reply.status(204).send() })
  app.post('/api/v1/knowledge-memory',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(knowledgeMemory.create(request.userId,knowledgeMemoryCreateSchema.parse(request.body))))
  app.post('/api/v1/knowledge-memory/:id/revisions',{preHandler:authenticated},async request=>knowledgeMemory.revise(request.userId,(request.params as {id:string}).id,knowledgeMemoryReviseSchema.parse(request.body)))
  app.post('/api/v1/knowledge-memory/versions/:id/invalidate',{preHandler:authenticated},async request=>knowledgeMemory.invalidate(request.userId,(request.params as {id:string}).id,knowledgeMemoryInvalidateSchema.parse(request.body).reason))
  app.get('/api/v1/knowledge-memory/:id/lineage',{preHandler:authenticated},async request=>knowledgeMemory.lineage(request.userId,(request.params as {id:string}).id))
  app.get('/api/v1/knowledge-memory/search',{preHandler:authenticated},async request=>{const query=request.query as {q?:string;projectId?:string;limit?:string;includeGlobal?:string};if(!query.q||query.q.length<2)throw new AppError('Search query is required.',400,'QUERY_REQUIRED');return knowledgeMemory.search(request.userId,query.q,{projectId:query.projectId,limit:Number(query.limit??10),includeGlobal:query.includeGlobal==='true'})})

  app.get('/api/v1/admin/workers', { preHandler:modelSyncAuthorized }, async()=>({data:workers.list()}))
  app.post('/api/internal/workers/register', { preHandler:workerAuthorized }, async request=>{const value=workerRegistrationSchema.parse(request.body);return workers.register(value.id,value.name,value.capabilities)})
  app.post('/api/internal/workers/:id/heartbeat', { preHandler:workerAuthorized }, async request=>workers.heartbeat((request.params as {id:string}).id))
  app.post('/api/internal/workers/:id/claim', { preHandler:workerAuthorized }, async request=>workers.claim((request.params as {id:string}).id)??{job:null})
  app.post('/api/internal/workers/:id/renew', { preHandler:workerAuthorized }, async request=>{const value=workerLeaseSchema.parse(request.body);return workers.renew((request.params as {id:string}).id,value.taskId,value.leaseToken)})
  app.post('/api/internal/workers/:id/drain', { preHandler:workerAuthorized }, async request=>workers.drain((request.params as {id:string}).id))
  app.post('/api/internal/workers/recover-expired', { preHandler:workerAuthorized }, async()=>workers.recover())

  app.get('/api/v1/divine-os/projects',{preHandler:authenticated},async request=>({data:divineOs.list(request.userId)}))
  app.post('/api/v1/divine-os/projects',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await divineOs.create(request.userId,divineOsSchema.parse(request.body))))
  app.get('/api/v1/divine-os/projects/:id',{preHandler:authenticated},async request=>divineOs.detail(request.userId,(request.params as {id:string}).id))
  app.patch('/api/v1/divine-os/projects/:id/base',{preHandler:authenticated},async request=>{const value=divineOsBaseSchema.parse(request.body);return divineOs.setBase(request.userId,(request.params as {id:string}).id,value.baseManifest)})
  app.post('/api/v1/divine-os/projects/:id/modules',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(divineOs.addModule(request.userId,(request.params as {id:string}).id,divineOsModuleSchema.parse(request.body))))
  app.get('/api/v1/divine-os/projects/:id/module-graph',{preHandler:authenticated},async request=>divineOs.analyzeModules(request.userId,(request.params as {id:string}).id))
  app.post('/api/v1/divine-os/projects/:id/resource-plan',{preHandler:authenticated},async request=>divineOs.resourcePlan(request.userId,(request.params as {id:string}).id,divineOsResourceSchema.parse(request.body)))

  app.get('/api/v1/divine-ecosystem/systems',{preHandler:authenticated},async request=>{const area=(request.query as {area?:'engine'|'os'}).area,data=area?divineSystemConcepts.filter(item=>item.area===area):divineSystemConcepts;return{data,summary:{total:data.length,foundation:data.filter(item=>item.status==='foundation').length,operational:data.filter(item=>item.status==='operational').length,planned:data.filter(item=>item.status==='planned').length}}})
  app.get('/api/v1/external-providers',{preHandler:authenticated},async()=>({data:externalProviders.list()}))
  app.get('/api/v1/external-providers/:id/health',{preHandler:authenticated},async request=>externalProviders.health((request.params as {id:string}).id))
  app.post('/api/v1/external-providers/execute',{preHandler:authenticated},async request=>externalProviders.execute(request.userId,externalJobSchema.parse(request.body)))
  app.post('/api/v1/tool-factory',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await toolFactory.create(request.userId,toolFactorySchema.parse(request.body))))
  app.post('/api/v1/projects/:id/release-package',{preHandler:authenticated},async(request,reply)=>{const value=releasePackageSchema.parse(request.body);return reply.status(201).send(await releasePackager.create(request.userId,{projectId:(request.params as {id:string}).id,...value}))})
  app.get('/api/v1/integrations/matrix',{preHandler:authenticated},async()=>({data:integrationMatrix,summary:Object.fromEntries(['native','active-adapter','partial','adapter-required','infrastructure-required','blocked','planned'].map(state=>[state,integrationMatrix.filter(item=>item.state===state).length]))}))
  app.get('/api/v1/v1-gaps',{preHandler:authenticated},async request=>{const area=(request.query as {area?:string}).area,data=area?v1Gaps.filter(item=>item.area===area):v1Gaps;return{data,summary:Object.fromEntries(['PARTIAL','ADAPTER_REQUIRED','INFRASTRUCTURE_REQUIRED','BLOCKED','PLANNED'].map(state=>[state,data.filter(item=>item.state===state).length]))}})
  app.get('/api/v1/external-validation-gates',{preHandler:authenticated},async()=>({blockingV1:false,data:externalValidationGates}))
  app.get('/api/v1/divine-engine/projects',{preHandler:authenticated},async request=>({data:divineEngine.list(request.userId)}))
  app.post('/api/v1/divine-engine/projects',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(divineEngine.create(request.userId,divineProjectSchema.parse(request.body))))
  app.get('/api/v1/divine-engine/projects/:id',{preHandler:authenticated},async request=>divineEngine.detail(request.userId,(request.params as {id:string}).id))
  app.get('/api/v1/divine-engine/settings-registry',{preHandler:authenticated},async()=>divineSettings.registry())
  app.get('/api/v1/divine-engine/projects/:id/settings',{preHandler:authenticated},async request=>divineSettings.get(request.userId,(request.params as {id:string}).id))
  app.patch('/api/v1/divine-engine/projects/:id/settings',{preHandler:authenticated},async request=>{const value=divineSettingsUpdateSchema.parse(request.body);return divineSettings.update(request.userId,(request.params as {id:string}).id,value.changes,value.preset)})
  app.post('/api/v1/divine-engine/projects/:id/presets/:preset',{preHandler:authenticated},async request=>divineSettings.applyPreset(request.userId,(request.params as {id:string;preset:string}).id,(request.params as {id:string;preset:string}).preset))
  app.get('/api/v1/divine-engine/projects/:id/commands',{preHandler:authenticated},async request=>({data:divineSettings.listCommands(request.userId,(request.params as {id:string}).id)}))
  app.post('/api/v1/divine-engine/projects/:id/commands',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(divineSettings.command(request.userId,(request.params as {id:string}).id,divineCommandSchema.parse(request.body))))
  app.post('/api/v1/divine-engine/projects/:id/prototype-3d',{preHandler:authenticated},async request=>divineEngine.createProceduralPrototype(request.userId,(request.params as {id:string}).id,(request.body as {prompt?:string}|undefined)?.prompt))
  app.post('/api/v1/procedural-3d/generate',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await procedural3d.generate(request.userId,procedural3dSchema.parse(request.body))))
  app.get('/api/v1/procedural-3d/:fileId/verify',{preHandler:authenticated},async request=>procedural3d.verifyFile(request.userId,(request.params as {fileId:string}).fileId))
  app.post('/api/v1/procedural-pbr/generate',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await proceduralPbr.generate(request.userId,pbrSchema.parse(request.body))))
  app.post('/api/v1/divine-engine/prototype-pipeline',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await prototypePipeline.build(request.userId,prototypePipelineSchema.parse(request.body))))
  app.post('/api/v1/divine-engine/experimental-4d',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await experimental4d.create(request.userId,experimental4dSchema.parse(request.body))))
  app.get('/api/v1/d-thesis/registry',{preHandler:authenticated},async()=>dThesis.registry())
  app.post('/api/v1/d-thesis/evaluate',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await dThesis.evaluate(request.userId,dThesisSchema.parse(request.body))))
  app.post('/api/v1/d-thesis/complement',{preHandler:authenticated,config:{rateLimit:{max:20,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await dThesis.complement(request.userId,dThesisComplementSchema.parse(request.body))))
  app.get('/api/v1/real-life/catalog',{preHandler:authenticated},async()=>realLife.catalog())
  app.post('/api/v1/real-life/domains',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(realLife.registerDomain(realLifeDomainSchema.parse(request.body))))
  app.post('/api/v1/real-life/compose',{preHandler:authenticated,config:{rateLimit:{max:20,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await realLife.compose(request.userId,realLifeComposeSchema.parse(request.body) as any)))
  app.get('/api/v1/nmn/capabilities',{preHandler:authenticated},async()=>nmn.capabilities())
  app.get('/api/v1/nmn/characters',{preHandler:authenticated},async request=>{const projectId=(request.query as {projectId?:string}).projectId;if(!projectId)throw new AppError('projectId é obrigatório.',400,'PROJECT_REQUIRED');return{data:await nmn.list(request.userId,projectId)}})
  app.post('/api/v1/nmn/simulate',{preHandler:authenticated,config:{rateLimit:{max:20,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await nmn.simulate(request.userId,nmnSimulateSchema.parse(request.body))))
  app.post('/api/v1/nmn/scenarios/war',{preHandler:authenticated,config:{rateLimit:{max:10,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await nmn.war(request.userId,nmnWarSchema.parse(request.body))))
  app.get('/api/v1/ues/autonomy/capabilities',{preHandler:authenticated},async()=>uesAutonomy.capabilities())
  app.get('/api/v1/ues/autonomy',{preHandler:authenticated},async request=>{const projectId=(request.query as {projectId?:string}).projectId;if(!projectId)throw new AppError('projectId é obrigatório.',400,'PROJECT_REQUIRED');return{data:await uesAutonomy.list(request.userId,projectId)}})
  app.post('/api/v1/ues/autonomy',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesAutonomy.create(request.userId,autonomyCreateSchema.parse(request.body))))
  app.post('/api/v1/ues/autonomy/:id/tick',{preHandler:authenticated},async request=>uesAutonomy.tick(request.userId,(request.params as {id:string}).id))
  app.post('/api/v1/ues/autonomy/:id/control',{preHandler:authenticated},async request=>{const value=autonomyControlSchema.parse(request.body);return uesAutonomy.control(request.userId,(request.params as {id:string}).id,value.action,value.alteration)})
  app.post('/api/v1/ues/autonomy/:id/decide',{preHandler:authenticated},async request=>uesAutonomy.decide(request.userId,(request.params as {id:string}).id,autonomyDecideSchema.parse(request.body).answer))
  app.post('/api/v1/ues/autonomy/:id/knowledge',{preHandler:authenticated},async request=>uesAutonomy.ingest(request.userId,(request.params as {id:string}).id,autonomyKnowledgeSchema.parse(request.body)))
  app.post('/api/v1/ues/multidimensional/build',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesMultidimensional.build(request.userId,multidimensionalBuildSchema.parse(request.body))))
  app.get('/api/v1/ues/world/capabilities',{preHandler:authenticated},async()=>uesWorld.capabilities())
  app.post('/api/v1/ues/world/build',{preHandler:authenticated,config:{rateLimit:{max:12,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesWorld.build(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/nav/compile',{preHandler:authenticated,config:{rateLimit:{max:12,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesNav.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/society/simulate',{preHandler:authenticated,config:{rateLimit:{max:10,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesSociety.simulate(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/audio/mix',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesAudio.mix(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/optimize/loop',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesOptimize.run(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/physics/ccd',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesPhysicsCcd.simulate(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/motion/stride',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesMotion.build(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/living-world/build',{preHandler:authenticated,config:{rateLimit:{max:8,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesLiving.build(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/craft/build',{preHandler:authenticated,config:{rateLimit:{max:8,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesCraft.build(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/physics/convex',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesPhysicsCcd.convex(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/vfx/simulate',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesVfx.simulate(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/navmesh/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesNavmesh.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/city/simulate',{preHandler:authenticated,config:{rateLimit:{max:8,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesCity.simulate(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/reference/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesReference.compile(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/continuum/build',{preHandler:authenticated,config:{rateLimit:{max:6,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesContinuum.build(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/corpus/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesCorpus.compile(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/critic/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesCritic.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/constraints/simulate',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesConstraints.simulate(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/regress/compare',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesRegress.compare(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/stream/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesStream.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/forge/build',{preHandler:authenticated,config:{rateLimit:{max:6,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesForge.build(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/planet/generate',{preHandler:authenticated,config:{rateLimit:{max:8,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesPlanet.generate(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/fnws/simulate',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesFnws.simulate(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/synthesis/build',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesSynthesis.synthesize(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/titko/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesTitko.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/umotion/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesUmotion.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/emulation/build',{preHandler:authenticated,config:{rateLimit:{max:5,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesEmulation.build(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.get('/api/v1/ues/gis/sources',{preHandler:authenticated},async()=>uesGis.catalog())
  app.post('/api/v1/ues/gis/ingest',{preHandler:authenticated,config:{rateLimit:{max:8,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesGis.ingest(request.userId,{...uesLivingBuildSchema.parse(request.body),sourceId:(request.body as {sourceId?:string}).sourceId})))
  app.post('/api/v1/ues/tiles/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesTiles.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/scale/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesScale.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/astro/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesAstro.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/articulation/simulate',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesArticulation.simulate(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/terrain-nav/compile',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesTerrainNav.compile(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.post('/api/v1/ues/explorer/apply',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await uesExplorer.apply(request.userId,uesLivingBuildSchema.parse(request.body))))
  app.get('/api/v1/ues/realis/status',{preHandler:authenticated},async()=>uesRealis.status())
  app.post('/api/v1/ues/realis/build',{preHandler:authenticated,config:{rateLimit:{max:4,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesRealis.build(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.get('/api/v1/ues/core/capabilities',{preHandler:authenticated},async()=>uesCore.capabilities())
  app.post('/api/v1/ues/core/build',{preHandler:authenticated,config:{rateLimit:{max:20,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesCore.build(request.userId,uesCoreBuildSchema.parse(request.body))))
  app.get('/api/v1/ues/advanced/capabilities',{preHandler:authenticated},async()=>uesAdvanced.capabilities())
  app.post('/api/v1/ues/advanced/build',{preHandler:authenticated,config:{rateLimit:{max:10,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await uesAdvanced.build(request.userId,uesAdvancedBuildSchema.parse(request.body))))
  app.get('/api/v1/hsds/capabilities',{preHandler:authenticated},async()=>hsds.capabilities())
  app.get('/api/v1/hsds/sessions',{preHandler:authenticated},async request=>({data:hsds.list(request.userId,(request.query as {projectId?:string}).projectId)}))
  app.post('/api/v1/hsds/sessions',{preHandler:authenticated,config:{rateLimit:{max:20,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(hsds.create(request.userId,hsdsCreateSchema.parse(request.body))))
  app.post('/api/v1/hsds/sessions/:id/input',{preHandler:authenticated,config:{rateLimit:{max:120,timeWindow:'1 minute'}}},async request=>hsds.input(request.userId,(request.params as {id:string}).id,hsdsInputSchema.parse(request.body)))
  app.post('/api/v1/hsds/sessions/:id/close',{preHandler:authenticated},async request=>hsds.close(request.userId,(request.params as {id:string}).id))
  app.get('/api/v1/hsds/sessions/:id/stream',{preHandler:authenticated},async(request,reply)=>{const sessionId=(request.params as {id:string}).id,frames=Array.from({length:3},()=>hsds.frame(request.userId,sessionId)),body=`retry: 500\n${frames.map(frame=>`event: frame\ndata: ${JSON.stringify(frame)}\n`).join('\n')}\nevent: batch-complete\ndata: ${JSON.stringify({nextAfterMs:Math.max(67,Math.round(3000/frames.length))})}\n\n`;return reply.type('text/event-stream').header('cache-control','no-cache, no-transform').header('x-accel-buffering','no').send(body)})
  app.get('/api/v1/artifact-graph/:projectId',{preHandler:authenticated},async request=>artifactGraph.graph(request.userId,(request.params as {projectId:string}).projectId))

  app.get('/api/v1/capability-fabric',{preHandler:authenticated},async request=>({data:capabilityFabric.list({status:(request.query as {status?:'discovered'|'testing'|'active'|'unavailable'|'disabled'}).status,capability:(request.query as {capability?:string}).capability})}))
  app.post('/api/v1/capability-fabric/pipeline/3d',{preHandler:authenticated},async request=>capabilityFabric.synthesize3D(pipeline3dSchema.parse(request.body).goal))
  app.post('/api/v1/admin/capability-fabric/discover',{preHandler:modelSyncAuthorized},async()=>capabilityFabric.discoverEnvironment())
  app.post('/api/v1/admin/capability-fabric/manifests',{preHandler:modelSyncAuthorized},async(request,reply)=>reply.status(201).send(capabilityFabric.register(manifestSchema.parse(request.body))))
  app.post('/api/v1/admin/capability-fabric/manifests/:id/validate',{preHandler:modelSyncAuthorized},async request=>capabilityFabric.validate((request.params as {id:string}).id,manifestValidationSchema.parse(request.body)))

  app.get('/api/v1/sandbox/policy',{preHandler:authenticated},async()=>sandbox.policy())
  app.post('/api/v1/sandbox/validate',{preHandler:authenticated,config:{rateLimit:{max:20,timeWindow:'1 minute'}}},async request=>{const value=sandboxSchema.parse(request.body);return sandbox.validate(request.userId,value.language,value.source)})

  app.get('/api/v1/approvals', {preHandler:authenticated},async request=>({data:approvals.list(request.userId,(request.query as {status?:'pending'|'approved'|'rejected'|'consumed'|'expired'}).status)}))
  app.post('/api/v1/approvals', {preHandler:authenticated},async(request,reply)=>reply.status(201).send(approvals.request(request.userId,approvalRequestSchema.parse(request.body))))
  app.post('/api/v1/approvals/:id/decide', {preHandler:authenticated},async request=>approvals.decide(request.userId,(request.params as {id:string}).id,approvalDecisionSchema.parse(request.body).decision))

  app.get('/api/v1/tools', { preHandler: authenticated }, async () => ({ data: tools.list(), physicalExecutionEnabled: appConfig.PHYSICAL_EXECUTION_ENABLED }))
  app.get('/api/v1/tools/executions', { preHandler: authenticated }, async request => ({ data: tools.history(request.userId, Number((request.query as {limit?:string}).limit??100)) }))
  app.get('/api/v1/tools/executions/:id', { preHandler: authenticated }, async request => tools.get(request.userId,(request.params as {id:string}).id))
  app.post('/api/v1/tools/executions/:id/verify-receipt', { preHandler: authenticated }, async request => tools.verifyReceipt(request.userId,(request.params as {id:string}).id,receiptSchema.parse(request.body).receipt))
  app.post('/api/v1/tools/:id/execute', { preHandler: authenticated, config:{rateLimit:{max:60,timeWindow:'1 minute'}} }, async request => { const value=toolExecutionSchema.parse(request.body);return tools.execute(request.userId,(request.params as {id:string}).id,value.input,{missionId:value.missionId,taskId:value.taskId,approvalId:value.approvalId}) })

  app.get('/api/v1/files', { preHandler: authenticated }, async request => ({ data: files.list(request.userId, (request.query as { projectId?: string }).projectId) }))
  app.post('/api/v1/files', { preHandler: authenticated }, async (request, reply) => { const part = await request.file(); if (!part) throw new AppError('Nenhum arquivo enviado.', 400, 'FILE_REQUIRED'); const projectId = (part.fields.projectId as { value?: string } | undefined)?.value; return reply.status(201).send(await files.upload(request.userId, part, projectId)) })
  app.get('/api/v1/files/:id/content', { preHandler: authenticated }, async (request, reply) => { const file = files.get(request.userId, (request.params as { id: string }).id); return reply.type(file.mimeType).header('content-disposition', `attachment; filename="${file.name.replaceAll('"', '')}"`).send(createReadStream(file.storagePath)) })
  app.delete('/api/v1/files/:id', { preHandler: authenticated }, async (request, reply) => { await files.delete(request.userId, (request.params as { id: string }).id); return reply.status(204).send() })
  app.get('/api/v1/audit', { preHandler: authenticated }, async request => ({ data: store.listAudit(request.userId, Math.min(Number((request.query as { limit?: string }).limit ?? 100), 200)) }))

  app.get('/api/v1/systems', async request => { const query = request.query as { domain?: string; status?: SystemStatus }; const data = singularitySystems.filter(system => (!query.domain || system.domain === query.domain) && (!query.status || system.status === query.status)); return { data, summary: systemSummary() } })
  app.get('/api/v1/capability-domains', async () => ({ data: capabilityDomains.map(domain => ({ ...domain, capabilityCount: domain.capabilities.length })), emergingDomains, summary: { domains: capabilityDomains.length, emergingDomains: emergingDomains.length, capabilities: universalCapabilities.length, previousSystems: singularitySystems.length, totalRegisteredNodes: universalCapabilities.length + singularitySystems.length } }))
  app.get('/api/v1/capability-domains/:id', async (request, reply) => { const domain = capabilityDomains.find(item => item.id === (request.params as { id: string }).id); return domain ? domain : reply.status(404).send({ error: { code: 'DOMAIN_NOT_FOUND', message: 'Domínio não encontrado.' } }) })
  app.get('/api/v1/master-intelligence/programs',{preHandler:authenticated},async()=>masterIntelligence.registry())
  app.get('/api/v1/master-intelligence/missions/:id/handoffs',{preHandler:authenticated},async request=>({data:cognitiveCollaboration.list(request.userId,(request.params as {id:string}).id)}))
  app.post('/api/v1/master-intelligence/handoffs',{preHandler:authenticated,config:{rateLimit:{max:60,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(cognitiveCollaboration.submit(request.userId,cognitiveHandoffSchema.parse(request.body))))
  app.post('/api/v1/master-intelligence/handoffs/:id/reviews',{preHandler:authenticated,config:{rateLimit:{max:60,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(cognitiveCollaboration.review(request.userId,(request.params as {id:string}).id,cognitiveReviewSchema.parse(request.body))))
  app.post('/api/v1/master-intelligence/handoffs/:id/schedule-correction',{preHandler:authenticated},async request=>cognitiveCollaboration.scheduleCorrection(request.userId,(request.params as {id:string}).id))
  app.post('/api/v1/master-intelligence/handoffs/:id/verify-correction',{preHandler:authenticated},async request=>cognitiveCollaboration.verifyCorrection(request.userId,(request.params as {id:string}).id,correctionVerificationSchema.parse(request.body).correctedHandoffId))
  app.get('/api/v1/documents/capabilities',{preHandler:authenticated},async()=>documentEngine.capabilities())
  app.post('/api/v1/documents',{preHandler:authenticated,config:{rateLimit:{max:20,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await documentEngine.create(request.userId,documentCreateSchema.parse(request.body))))
  app.get('/api/v1/documents/:fileId/verify',{preHandler:authenticated},async request=>documentEngine.verifyFile(request.userId,(request.params as {fileId:string}).fileId))
  app.get('/api/v1/automations',{preHandler:authenticated},async request=>automationEngine.list(request.userId))
  app.post('/api/v1/automations',{preHandler:authenticated},async(request,reply)=>reply.status(201).send(await automationEngine.create(request.userId,automationCreateSchema.parse(request.body))))
  app.post('/api/v1/automations/:id/enable',{preHandler:authenticated},async request=>automationEngine.setEnabled(request.userId,(request.params as {id:string}).id,true))
  app.post('/api/v1/automations/:id/disable',{preHandler:authenticated},async request=>automationEngine.setEnabled(request.userId,(request.params as {id:string}).id,false))
  app.post('/api/v1/automations/tick',{preHandler:authenticated},async request=>automationEngine.tick(request.userId))
  app.post('/api/v1/automations/events/:event',{preHandler:authenticated},async request=>automationEngine.emit(request.userId,(request.params as {event:string}).event,z.record(z.string(),z.unknown()).parse(request.body)))
  app.get('/api/v1/plugins/capabilities',{preHandler:authenticated},async()=>pluginRuntime.capabilities())
  app.get('/api/v1/plugins',{preHandler:authenticated},async request=>({data:await pluginRuntime.list(request.userId)}))
  app.post('/api/v1/plugins',{preHandler:authenticated},async(request,reply)=>{const value=pluginInstallSchema.parse(request.body);return reply.status(201).send(await pluginRuntime.install(request.userId,{projectId:value.projectId,manifest:value.manifest,payload:Buffer.from(value.payloadBase64,'base64')}))})
  app.post('/api/v1/plugins/:id/:version/enable',{preHandler:authenticated},async request=>pluginRuntime.transition(request.userId,(request.params as {id:string;version:string}).id,(request.params as {id:string;version:string}).version,'enabled'))
  app.post('/api/v1/plugins/:id/:version/disable',{preHandler:authenticated},async request=>pluginRuntime.transition(request.userId,(request.params as {id:string;version:string}).id,(request.params as {id:string;version:string}).version,'disabled'))
  app.delete('/api/v1/plugins/:id/:version',{preHandler:authenticated},async request=>pluginRuntime.remove(request.userId,(request.params as {id:string;version:string}).id,(request.params as {id:string;version:string}).version))
  app.post('/api/v1/missions/:id/branch',{preHandler:authenticated},async request=>workflowControl.branch(request.userId,(request.params as {id:string}).id,workflowBranchSchema.parse(request.body)))
  app.post('/api/v1/missions/:id/compensate',{preHandler:authenticated},async request=>workflowControl.compensate(request.userId,(request.params as {id:string}).id,compensationSchema.parse(request.body)))
  app.get('/api/v1/offline-sync',{preHandler:authenticated},async request=>offlineSync.status(request.userId))
  app.post('/api/v1/offline-sync/documents/:key',{preHandler:authenticated},async request=>offlineSync.seed(request.userId,(request.params as {key:string}).key,z.record(z.string(),z.unknown()).parse(request.body)))
  app.post('/api/v1/offline-sync/operations',{preHandler:authenticated},async request=>{const value=offlineSyncSchema.parse(request.body);return offlineSync.sync(request.userId,value.operations,value.strategy)})
  app.post('/api/v1/offline-sync/conflicts/:id/resolve',{preHandler:authenticated},async request=>{const value=z.object({resolution:z.enum(['server','client']),clientPatch:z.record(z.string(),z.unknown()).optional()}).parse(request.body);return offlineSync.resolve(request.userId,(request.params as {id:string}).id,value.resolution,value.clientPatch)})
  app.post('/api/v1/offline-sync/chunks',{preHandler:authenticated},async request=>offlineSync.chunk(request.userId,z.object({uploadId:z.string(),index:z.number().int(),total:z.number().int(),checksum:z.string(),data:z.string()}).parse(request.body)))
  app.post('/api/v1/master-intelligence/compile',{preHandler:authenticated,config:{rateLimit:{max:20,timeWindow:'1 minute'}}},async(request,reply)=>reply.status(201).send(await masterIntelligence.compile(request.userId,masterCompileSchema.parse(request.body))))
  app.post('/api/v1/problem-solver/analyze', { preHandler: authenticated }, async request => problemSolver.analyze(problemSchema.parse(request.body).problem))
  app.post('/api/v1/problem-solver/compile', { preHandler: authenticated }, async (request, reply) => { const value = problemSchema.parse(request.body); const analysis = problemSolver.analyze(value.problem); if (analysis.classification === 'domain-discovery-required' && !value.allowUnverifiedDomain) throw new AppError('O problema exige um novo Domain Profile antes da execução.', 409, 'DOMAIN_DISCOVERY_APPROVAL_REQUIRED', analysis.domainDiscovery); const compiled = missions.create(request.userId, value.problem, analysis.taskGraph.nodes.map(node => ({ key: node.key, title: node.title, kind: node.kind, dependsOn: node.dependsOn, input: { domainIds: node.domainIds, requiresHumanApproval: node.requiresHumanApproval, problemGraphId: analysis.graphId } })), value.projectId,{userIntent:value.problem,requiredCapabilities:analysis.domains.map(domain=>domain.id),constraints:analysis.safety,risks:analysis.safety,successCriteria:['Task Graph concluído','Verification stage aprovada'],verificationRequirements:['Verifier determinístico quando disponível','Proveniência preservada'],finalDeliverable:'Resultado da missão com evidências, limitações e verificação',autonomy:'SUPERVISED'}); return reply.status(201).send({ analysis, ...compiled }) })
  app.get('/api/v1/capabilities', async () => ({ data: [
    { id: 'chat', status: 'ready' }, { id: 'orchestration', status: 'ready' }, { id: 'memory', status: 'ready' },
    { id: 'projects', status: 'ready' }, { id: 'research', status: 'adapter-required' }, { id: 'image', status: 'adapter-required' },
    { id: 'video', status: 'adapter-required' }, { id: 'audio', status: 'adapter-required' }, { id: '3d', status: 'adapter-required' },
  ] }))

  return app
}
