import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from './app.js'

let app: FastifyInstance | undefined
afterEach(async () => { await app?.close(); app = undefined })

async function authenticatedApp() {
  app = await buildApp({ NODE_ENV: 'test' })
  const session = await app.inject({ method: 'POST', url: '/api/v1/auth/guest' })
  const token = session.json().token as string
  return { app, headers: { authorization: `Bearer ${token}` } }
}

describe('Singularity API', () => {
  it('reports service health', async () => {
    app = await buildApp({ NODE_ENV: 'test' })
    const response = await app.inject({ method: 'GET', url: '/api/health' })
    expect(response.statusCode).toBe(200)
    expect(response.json().status).toBe('ok')
  })

  it('applies security headers and refuses unlisted CORS origins',async()=>{app=await buildApp({NODE_ENV:'test',CORS_ORIGIN:'http://allowed.test'});const health=await app.inject({method:'GET',url:'/api/health'});expect(health.headers['x-content-type-options']).toBe('nosniff');const denied=await app.inject({method:'OPTIONS',url:'/api/health',headers:{origin:'https://evil.test','access-control-request-method':'GET'}});expect(denied.headers['access-control-allow-origin']).not.toBe('https://evil.test');const allowed=await app.inject({method:'OPTIONS',url:'/api/health',headers:{origin:'http://allowed.test','access-control-request-method':'GET'}});expect(allowed.headers['access-control-allow-origin']).toBe('http://allowed.test')})

  it('rejects protected endpoints without a session', async () => {
    app = await buildApp({ NODE_ENV: 'test' })
    const response = await app.inject({ method: 'GET', url: '/api/v1/projects' })
    expect(response.statusCode).toBe(401)
    expect(response.json().error.code).toBe('UNAUTHORIZED')
  })

  it('creates isolated projects and lists them', async () => {
    const context = await authenticatedApp()
    const created = await context.app.inject({ method: 'POST', url: '/api/v1/projects', headers: context.headers, payload: { name: 'Nexus', description: 'Core workspace' } })
    expect(created.statusCode).toBe(201)
    const list = await context.app.inject({ method: 'GET', url: '/api/v1/projects', headers: context.headers })
    expect(list.json().data).toHaveLength(1)
    expect(list.json().data[0].name).toBe('Nexus')
  })

  it('orchestrates a conversation with model metadata and plan', async () => {
    const context = await authenticatedApp()
    const response = await context.app.inject({ method: 'POST', url: '/api/v1/chat', headers: context.headers, payload: { message: 'Planeje a arquitetura de um app em TypeScript', mode: 'deep' } })
    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.message.role).toBe('assistant')
    expect(body.plan).toContain('Selecionar especialista')
    expect(body.model.provider).toBe('singularity-local')
    expect(body.trust.verification.status).toBe('not-verified')
    expect(body.message.metadata.verificationStatus).toBe('not-verified')
    expect(body.conversationId).toMatch(/^conv_/)
  })

  it('stores and retrieves relevant memory', async () => {
    const context = await authenticatedApp()
    const memory = await context.app.inject({ method: 'POST', url: '/api/v1/memories', headers: context.headers, payload: { content: 'O usuário prefere TypeScript em projetos web', kind: 'preference', importance: 90 } })
    expect(memory.statusCode).toBe(201)
    const response = await context.app.inject({ method: 'POST', url: '/api/v1/chat', headers: context.headers, payload: { message: 'Crie um projeto web com TypeScript', mode: 'auto' } })
    expect(response.json().contextItems).toBe(1)
  })

  it('recovers a password with a single-use expiring local-beta token',async()=>{
    app=await buildApp({NODE_ENV:'test'});await app.inject({method:'POST',url:'/api/v1/auth/register',payload:{email:'recover@bunker.test',password:'original-password-123',name:'Recovery User'}})
    const requested=await app.inject({method:'POST',url:'/api/v1/auth/password-reset/request',payload:{email:'recover@bunker.test'}});expect(requested.statusCode).toBe(200);expect(requested.json().developmentResetToken).toBeDefined();const token=requested.json().developmentResetToken
    const confirmed=await app.inject({method:'POST',url:'/api/v1/auth/password-reset/confirm',payload:{token,password:'replacement-password-456'}});expect(confirmed.statusCode).toBe(200)
    const reused=await app.inject({method:'POST',url:'/api/v1/auth/password-reset/confirm',payload:{token,password:'another-password-789'}});expect(reused.statusCode).toBe(401)
    const login=await app.inject({method:'POST',url:'/api/v1/auth/login',payload:{email:'recover@bunker.test',password:'replacement-password-456'}});expect(login.statusCode).toBe(200)
  })

  it('rotates refresh tokens and rejects reuse', async () => {
    app = await buildApp({ NODE_ENV: 'test' })
    const registration = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email: 'founder@bunker.test', password: 'extremely-secure-password', name: 'Founder' } })
    expect(registration.statusCode).toBe(200)
    const first = registration.json().refreshToken as string
    const refreshed = await app.inject({ method: 'POST', url: '/api/v1/auth/refresh', payload: { refreshToken: first } })
    expect(refreshed.statusCode).toBe(200)
    expect(refreshed.json().refreshToken).not.toBe(first)
    const reuse = await app.inject({ method: 'POST', url: '/api/v1/auth/refresh', payload: { refreshToken: first } })
    expect(reuse.statusCode).toBe(401)
  })

  it('streams status, deltas, and completion metadata over SSE', async () => {
    const context = await authenticatedApp()
    const response = await context.app.inject({ method: 'POST', url: '/api/v1/chat/stream', headers: context.headers, payload: { message: 'Crie uma arquitetura modular', mode: 'auto' } })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/event-stream')
    expect(response.body).toContain('event: status')
    expect(response.body).toContain('event: delta')
    expect(response.body).toContain('event: done')
  })

  it('keeps synchronized Puter models unranked until benchmark evidence exists', async () => {
    app = await buildApp({ NODE_ENV: 'test' })
    const headers = { 'x-model-sync-secret': 'development-model-sync-secret-change-me' }
    const sync = await app.inject({ method: 'POST', url: '/api/v1/admin/models/puter/sync', headers, payload: { models: [{ id: 'catalog-fixture', provider: 'fixture-provider', context: 32000 }] } })
    expect(sync.statusCode).toBe(200)
    expect(sync.json().total).toBe(1)
    for (let index = 0; index < 3; index++) await app.inject({ method: 'POST', url: '/api/v1/admin/models/evaluations', headers, payload: { modelKey: 'puter:fixture-provider:catalog-fixture', capability: 'code', score: 96, benchmark: `isolated-fixture-${index}`, success: true, latencyMs: 100 } })
    const session = await app.inject({ method: 'POST', url: '/api/v1/auth/guest' })
    const route = await app.inject({ method: 'GET', url: '/api/v1/models/puter/route/code', headers: { authorization: `Bearer ${session.json().token as string}` } })
    expect(route.json().candidates[0].ranking.tier).toBe('S++')
    expect(route.json().candidates[0].ranking.evidence).toBe(3)
  })

  it('rejects unauthorized catalog synchronization', async () => {
    app = await buildApp({ NODE_ENV: 'test' })
    const response = await app.inject({ method: 'POST', url: '/api/v1/admin/models/puter/sync', payload: { models: [{ id: 'fixture', provider: 'fixture' }] } })
    expect(response.statusCode).toBe(401)
  })

  it('plans a parallel research swarm only from explicit web_search metadata',async()=>{const context=await authenticatedApp(),admin={'x-model-sync-secret':'development-model-sync-secret-change-me'},models=Array.from({length:5},(_,index)=>({id:`search-fixture-${index}`,provider:'fixture',modalities:{input:['text'],output:['text']},costs:{web_search:1000}}));await context.app.inject({method:'POST',url:'/api/v1/admin/models/puter/sync',headers:admin,payload:{models}});const plan=await context.app.inject({method:'POST',url:'/api/v1/research/plan',headers:context.headers,payload:{query:'current verified information',modelCount:3}});expect(plan.statusCode).toBe(200);expect(plan.json().eligibleTotal).toBe(5);expect(plan.json().researchers).toHaveLength(3);expect(plan.json().policy).toBe('explicit-web-search-metadata-unranked-beta');expect(new Set(plan.json().researchers.map((item:{key:string})=>item.key)).size).toBe(3)})

  it('queues exact models and keeps client benchmark results untrusted until verification', async () => {
    const context = await authenticatedApp(); const admin = { 'x-model-sync-secret': 'development-model-sync-secret-change-me' }
    await context.app.inject({ method: 'POST', url: '/api/v1/admin/models/puter/sync', headers: admin, payload: { models: [{ id: 'fixture-text-a', provider: 'fixture', modalities: { input: ['text'], output: ['text'] } }, { id: 'fixture-text-b', provider: 'fixture', modalities: { input: ['text'], output: ['text'] } }, { id: 'fixture-vision', provider: 'fixture', modalities: { input: ['text','image'], output: ['text'] } }] } })
    const created = await context.app.inject({ method: 'POST', url: '/api/v1/benchmarks/campaigns', headers: context.headers, payload: { capability: 'code', benchmarkVersion: 'code-v1' } })
    expect(created.statusCode).toBe(201); expect(created.json().campaign.totalJobs).toBe(3)
    const campaignId=created.json().campaign.id as string
    const claim=await context.app.inject({method:'POST',url:`/api/v1/benchmarks/campaigns/${campaignId}/claim`,headers:context.headers});const claimed=claim.json()
    const forged=await context.app.inject({method:'POST',url:`/api/v1/benchmarks/jobs/${claimed.job.id}/submit`,headers:context.headers,payload:{claimToken:'x'.repeat(48),output:{answer:'forged'},latencyMs:10}});expect(forged.statusCode).toBe(401)
    const submitted=await context.app.inject({method:'POST',url:`/api/v1/benchmarks/jobs/${claimed.job.id}/submit`,headers:context.headers,payload:{claimToken:claimed.claimToken,output:{answer:'candidate output'},latencyMs:125}});expect(submitted.json().tierChanged).toBe(false);expect(submitted.json().trust).toBe('awaiting-trusted-evaluation')
    const verified=await context.app.inject({method:'POST',url:`/api/v1/admin/benchmarks/jobs/${claimed.job.id}/verify`,headers:admin,payload:{score:96,success:true}});expect(verified.json().ranking.ranking.tier).toBe('UNRANKED')
  })

  it('executes and independently verifies a deterministic tool with a signed receipt', async () => {
    const context=await authenticatedApp()
    const response=await context.app.inject({method:'POST',url:'/api/v1/tools/core.math.aggregate/execute',headers:context.headers,payload:{input:{operation:'average',values:[2,4,6]}}})
    expect(response.statusCode).toBe(200);const execution=response.json();expect(execution.output.result).toBe(4);expect(execution.verification.verified).toBe(true);expect(execution.receipt).toMatch(/^hmac-sha256:/)
    const valid=await context.app.inject({method:'POST',url:`/api/v1/tools/executions/${execution.id}/verify-receipt`,headers:context.headers,payload:{receipt:execution.receipt}});expect(valid.json().valid).toBe(true)
    const invalid=await context.app.inject({method:'POST',url:`/api/v1/tools/executions/${execution.id}/verify-receipt`,headers:context.headers,payload:{receipt:'hmac-sha256:'+'0'.repeat(64)}});expect(invalid.json().valid).toBe(false)
  })

  it('requires a persistent one-time approval for medium-risk write tools',async()=>{
    const context=await authenticatedApp();const denied=await context.app.inject({method:'POST',url:'/api/v1/tools/core.audit.note/execute',headers:context.headers,payload:{input:{note:'approved beta note'}}});expect(denied.statusCode).toBe(409);expect(denied.json().error.code).toBe('TOOL_APPROVAL_REQUIRED')
    const requested=await context.app.inject({method:'POST',url:'/api/v1/approvals',headers:context.headers,payload:{action:'tool:core.audit.note',risk:'medium',rationale:'User requested an audited note'}});const approvalId=requested.json().id
    await context.app.inject({method:'POST',url:`/api/v1/approvals/${approvalId}/decide`,headers:context.headers,payload:{decision:'approved'}})
    const executed=await context.app.inject({method:'POST',url:'/api/v1/tools/core.audit.note/execute',headers:context.headers,payload:{input:{note:'approved beta note'},approvalId}});expect(executed.statusCode).toBe(200);expect(executed.json().verification.verified).toBe(true)
    const reused=await context.app.inject({method:'POST',url:'/api/v1/tools/core.audit.note/execute',headers:context.headers,payload:{input:{note:'reuse'},approvalId}});expect(reused.statusCode).toBe(409);expect(reused.json().error.code).toBe('APPROVAL_REQUIRED')
  })

  it('keeps physical execution disabled and auditable', async () => {
    const context=await authenticatedApp();const response=await context.app.inject({method:'POST',url:'/api/v1/tools/physical.robot.execute/execute',headers:context.headers,payload:{input:{objective:'move'}}});expect(response.statusCode).toBe(403);expect(response.json().error.code).toBe('TOOL_POLICY_DENIED')
    const history=await context.app.inject({method:'GET',url:'/api/v1/tools/executions',headers:context.headers});expect(history.json().data[0].status).toBe('denied')
  })

  it('opens a circuit breaker after repeated tool failures', async () => {
    const context=await authenticatedApp();for(let index=0;index<3;index++){const failed=await context.app.inject({method:'POST',url:'/api/v1/tools/core.math.aggregate/execute',headers:context.headers,payload:{input:{operation:'sum',values:[]}}});expect(failed.statusCode).toBe(502)}
    const blocked=await context.app.inject({method:'POST',url:'/api/v1/tools/core.math.aggregate/execute',headers:context.headers,payload:{input:{operation:'sum',values:[1]}}});expect(blocked.statusCode).toBe(503);expect(blocked.json().error.code).toBe('TOOL_CIRCUIT_OPEN')
  })

  it('persists Puter client reports only for canonical exact models without claiming provider attestation',async()=>{
    const context=await authenticatedApp();const admin={'x-model-sync-secret':'development-model-sync-secret-change-me'};await context.app.inject({method:'POST',url:'/api/v1/admin/models/puter/sync',headers:admin,payload:{models:[{id:'exact-beta-model',provider:'fixture',modalities:{input:['text'],output:['text']}}]}})
    const reported=await context.app.inject({method:'POST',url:'/api/v1/puter/executions',headers:context.headers,payload:{prompt:'beta prompt',response:'beta response',provider:'fixture',modelId:'exact-beta-model',durationMs:123,startedAt:new Date().toISOString(),fallbackChain:[]}});expect(reported.statusCode).toBe(200);expect(reported.json().trust.providerAttested).toBe(false);expect(reported.json().report.receipt).toMatch(/^snb-client-report-hmac:/);expect(reported.json().message.metadata.verificationStatus).toBe('not-verified')
    const rejected=await context.app.inject({method:'POST',url:'/api/v1/puter/executions',headers:context.headers,payload:{prompt:'x',response:'y',provider:'invented',modelId:'not-in-catalog',durationMs:1,startedAt:new Date().toISOString(),fallbackChain:[]}});expect(rejected.statusCode).toBe(400);expect(rejected.json().error.code).toBe('PUTER_MODEL_NOT_CANONICAL')
  })

  it('creates a real Divine Engine project graph without faking missing 3D artifacts',async()=>{const context=await authenticatedApp();const created=await context.app.inject({method:'POST',url:'/api/v1/divine-engine/projects',headers:context.headers,payload:{name:'Future City',brief:'Open-world futuristic city with vehicles, NPCs and dynamic weather',target:'unreal',executionPolicy:'remote-first',deviceProfile:{tier:'low',memoryGB:1}}});expect(created.statusCode).toBe(201);const body=created.json();expect(body.divine.format).toBe('snb-divine-project-v1');expect(body.divine.status).toBe('blocked');expect(body.bosses).toHaveLength(14);expect(body.bosses[0].boss).toBe('master-ai');expect(body.bosses.at(-1).boss).toBe('build');expect(body.artifacts).toHaveLength(0);expect(body.execution.deviceRole).toBe('terminal');expect(body.execution.preview.viewport).toBe(false);expect(body.pipeline3d.gaps).not.toContain('3d.generate');expect(body.pipeline3d.gaps).toContain('3d.retopology');const list=await context.app.inject({method:'GET',url:'/api/v1/divine-engine/projects',headers:context.headers});expect(list.json().data[0].progress).toBe(0);const prototype=await context.app.inject({method:'POST',url:`/api/v1/divine-engine/projects/${body.divine.id}/prototype-3d`,headers:context.headers,payload:{prompt:'futuristic city blockout'}});expect(prototype.statusCode).toBe(200);expect(prototype.json().result.verification.valid).toBe(true);expect(prototype.json().project.artifacts).toHaveLength(1)})

  it('creates a blocked, auditable Divine OS foundation without pretending to build an OS',async()=>{const context=await authenticatedApp();const created=await context.app.inject({method:'POST',url:'/api/v1/divine-os/projects',headers:context.headers,payload:{name:'DivineDroid Alpha',variant:'droid'}});expect(created.statusCode).toBe(201);const body=created.json();expect(body.os.status).toBe('blocked');expect(body.tasks).toHaveLength(14);expect(body.artifacts.some((item:{name:string})=>item.name==='divine-os-project.json')).toBe(true);expect(body.capabilities.gaps).toContain('android.build');expect(body.build.executable).toBe(false);const configured=await context.app.inject({method:'PATCH',url:`/api/v1/divine-os/projects/${body.os.id}/base`,headers:context.headers,payload:{baseManifest:{sourceUrl:'https://example.com/android-source.tar.gz',license:'Apache-2.0',checksum:'a'.repeat(64)}}});expect(configured.json().os.compliance.status).toBe('pass');expect(configured.json().os.status).toBe('blocked');const module=await context.app.inject({method:'POST',url:`/api/v1/divine-os/projects/${body.os.id}/modules`,headers:context.headers,payload:{name:'Unsafe Host Modifier',version:'0.1.0',capabilities:['host.modify'],dependencies:[],permissions:['host-root'],manifest:{}}});expect(module.json().status).toBe('blocked');await context.app.inject({method:'POST',url:`/api/v1/divine-os/projects/${body.os.id}/modules`,headers:context.headers,payload:{name:'Module A',version:'1',capabilities:['a'],dependencies:['Module B'],permissions:[],manifest:{}}});await context.app.inject({method:'POST',url:`/api/v1/divine-os/projects/${body.os.id}/modules`,headers:context.headers,payload:{name:'Module B',version:'1',capabilities:['b'],dependencies:['Module A'],permissions:[],manifest:{}}});const graph=await context.app.inject({method:'GET',url:`/api/v1/divine-os/projects/${body.os.id}/module-graph`,headers:context.headers});expect(graph.json().valid).toBe(false);expect(graph.json().cycles.length).toBeGreaterThan(0);const resources=await context.app.inject({method:'POST',url:`/api/v1/divine-os/projects/${body.os.id}/resource-plan`,headers:context.headers,payload:{ramMB:1024,cpuCores:2,storageMB:8192,batteryPowered:true}});expect(resources.json().plan.tier).toBe('low');expect(resources.json().plan.buildExecution).toBe('remote-required');expect(resources.json().plan.cpu.maxConcurrentServices).toBe(2)})

  it('executes a persistent mission DAG with dependency gates and retries', async () => {
    const context = await authenticatedApp()
    const created = await context.app.inject({ method: 'POST', url: '/api/v1/missions', headers: context.headers, payload: { goal: 'Build and verify Nexus', tasks: [{ key: 'plan', title: 'Plan', kind: 'planning', maxAttempts: 2 }, { key: 'build', title: 'Build', kind: 'code', dependsOn: ['plan'] }] } })
    expect(created.statusCode).toBe(201)
    const body = created.json(); const missionId = body.mission.id as string; const plan = body.tasks[0]; const build = body.tasks[1]
    const blocked = await context.app.inject({ method: 'POST', url: `/api/v1/missions/${missionId}/tasks/${build.id}/start`, headers: context.headers })
    expect(blocked.statusCode).toBe(409)
    await context.app.inject({ method: 'POST', url: `/api/v1/missions/${missionId}/tasks/${plan.id}/start`, headers: context.headers })
    const retry = await context.app.inject({ method: 'POST', url: `/api/v1/missions/${missionId}/tasks/${plan.id}/fail`, headers: context.headers, payload: { reason: 'temporary provider failure', retryable: true } })
    expect(retry.json().tasks[0].status).toBe('pending')
    await context.app.inject({ method: 'POST', url: `/api/v1/missions/${missionId}/tasks/${plan.id}/start`, headers: context.headers })
    await context.app.inject({ method: 'POST', url: `/api/v1/missions/${missionId}/tasks/${plan.id}/complete`, headers: context.headers, payload: { output: { approved: true } } })
    await context.app.inject({ method: 'POST', url: `/api/v1/missions/${missionId}/tasks/${build.id}/start`, headers: context.headers })
    const completed = await context.app.inject({ method: 'POST', url: `/api/v1/missions/${missionId}/tasks/${build.id}/complete`, headers: context.headers, payload: { output: { artifact: 'nexus' } } })
    expect(completed.json().mission.status).toBe('completed')
    expect(completed.json().mission.progress).toBe(100)
  })

  it('persists the mission contract and supports pause/resume phases',async()=>{
    const context=await authenticatedApp();const created=await context.app.inject({method:'POST',url:'/api/v1/missions',headers:context.headers,payload:{goal:'Supervised verified delivery',userIntent:'Build safely',constraints:['No external writes'],risks:['Incorrect output'],successCriteria:['Verifier approved'],verificationRequirements:['Deterministic check'],finalDeliverable:'Verified artifact',autonomy:'SUPERVISED',tasks:[{key:'plan',title:'Plan',kind:'planning'}]}});expect(created.statusCode).toBe(201);expect(created.json().contract.phase).toBe('CREATED');expect(created.json().contract.autonomy).toBe('SUPERVISED')
    const missionId=created.json().mission.id;const paused=await context.app.inject({method:'POST',url:`/api/v1/missions/${missionId}/pause`,headers:context.headers});expect(paused.json().contract.phase).toBe('PAUSED')
    const resumed=await context.app.inject({method:'POST',url:`/api/v1/missions/${missionId}/resume`,headers:context.headers});expect(resumed.json().contract.phase).toBe('REPLANNING')
  })

  it('rejects cyclic mission graphs', async () => {
    const context = await authenticatedApp()
    const response = await context.app.inject({ method: 'POST', url: '/api/v1/missions', headers: context.headers, payload: { goal: 'Invalid cycle', tasks: [{ key: 'a', title: 'A', kind: 'test', dependsOn: ['b'] }, { key: 'b', title: 'B', kind: 'test', dependsOn: ['a'] }] } })
    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe('CYCLIC_TASK_GRAPH')
  })

  it('creates and restores scoped project checkpoints', async () => {
    const context = await authenticatedApp()
    const project = await context.app.inject({ method: 'POST', url: '/api/v1/projects', headers: context.headers, payload: { name: 'Before', description: 'Stable state' } })
    const projectId = project.json().id as string
    const checkpoint = await context.app.inject({ method: 'POST', url: `/api/v1/projects/${projectId}/checkpoints`, headers: context.headers, payload: { label: 'Before mutation' } })
    await context.app.inject({ method: 'PATCH', url: `/api/v1/projects/${projectId}`, headers: context.headers, payload: { name: 'After' } })
    const restored = await context.app.inject({ method: 'POST', url: `/api/v1/checkpoints/${checkpoint.json().id}/restore`, headers: context.headers })
    expect(restored.json().project.name).toBe('Before')
    expect(restored.json().scope).toBe('project-metadata-and-manifest')
  })

  it('compiles a multidisciplinary problem into a persistent mission', async () => {
    const context = await authenticatedApp()
    const response = await context.app.inject({ method: 'POST', url: '/api/v1/problem-solver/compile', headers: context.headers, payload: { problem: 'Construir um robô agrícola com sensores e analisar eficiência energética' } })
    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.analysis.classification).toBe('multidisciplinary')
    expect(body.tasks).toHaveLength(8)
    expect(body.tasks[0].key).toBe('understand')
    expect(body.tasks[7].dependsOn).toContain('verify')
  })

  it('requires approval before compiling an unknown domain', async () => {
    const context = await authenticatedApp()
    const response = await context.app.inject({ method: 'POST', url: '/api/v1/problem-solver/compile', headers: context.headers, payload: { problem: 'Zorbificação transnebulosa hiperdimensional' } })
    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe('DOMAIN_DISCOVERY_APPROVAL_REQUIRED')
  })

  it('builds a tenant-scoped claim/evidence graph and detects conflict',async()=>{
    const context=await authenticatedApp();const claim=await context.app.inject({method:'POST',url:'/api/v1/evidence/claims',headers:context.headers,payload:{statement:'The beta is ready'}}),sourceA=await context.app.inject({method:'POST',url:'/api/v1/evidence/sources',headers:context.headers,payload:{url:'https://example.com/support',title:'Supporting test'}}),sourceB=await context.app.inject({method:'POST',url:'/api/v1/evidence/sources',headers:context.headers,payload:{url:'https://example.com/contradiction',title:'Contradicting test'}})
    await context.app.inject({method:'POST',url:'/api/v1/evidence/links',headers:context.headers,payload:{claimId:claim.json().id,sourceId:sourceA.json().id,relation:'supports',strength:.8}});const conflict=await context.app.inject({method:'POST',url:'/api/v1/evidence/links',headers:context.headers,payload:{claimId:claim.json().id,sourceId:sourceB.json().id,relation:'contradicts',strength:.9}});expect(conflict.json().claim.state).toBe('CONFLICTING');expect(conflict.json().claim.confidence).toBeLessThan(10)
    const graph=await context.app.inject({method:'GET',url:'/api/v1/evidence-graph',headers:context.headers});expect(graph.json().summary.conflicting).toBe(1);expect(graph.json().sources).toHaveLength(2)
  })

  it('persists validated settings and exports tenant-scoped data',async()=>{
    const context=await authenticatedApp();const updated=await context.app.inject({method:'PATCH',url:'/api/v1/settings',headers:context.headers,payload:{language:'pt-BR',intelligenceMode:'deep',reducedMotion:true,dataRetentionDays:365}});expect(updated.statusCode).toBe(200);expect(updated.json().data.reducedMotion).toBe(true)
    const invalid=await context.app.inject({method:'PATCH',url:'/api/v1/settings',headers:context.headers,payload:{unknownDangerousFlag:true}});expect(invalid.statusCode).toBe(400)
    const exported=await context.app.inject({method:'GET',url:'/api/v1/data-export',headers:context.headers});expect(exported.statusCode).toBe(200);expect(exported.json().userId).toMatch(/^guest_/);expect(exported.json().settings.intelligenceMode).toBe('deep');expect(Array.isArray(exported.json().audit)).toBe(true)
  })

  it('persists workspace data across process restarts', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'singularity-'))
    const database = join(directory, 'test.db')
    let persistent = await buildApp({ NODE_ENV: 'development', LOG_LEVEL: 'silent', DATABASE_PATH: database })
    const session = await persistent.inject({ method: 'POST', url: '/api/v1/auth/guest' })
    const headers = { authorization: `Bearer ${session.json().token as string}` }
    await persistent.inject({ method: 'POST', url: '/api/v1/projects', headers, payload: { name: 'Persistent Nexus' } })
    await persistent.close()
    persistent = await buildApp({ NODE_ENV: 'development', LOG_LEVEL: 'silent', DATABASE_PATH: database })
    const list = await persistent.inject({ method: 'GET', url: '/api/v1/projects', headers })
    expect(list.json().data[0].name).toBe('Persistent Nexus')
    await persistent.close(); await rm(directory, { recursive: true, force: true })
  })
})
