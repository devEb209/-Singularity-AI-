const TOKEN_KEY = 'singularity:session'
const REFRESH_KEY = 'singularity:refresh'

export interface ChatResponse {
  conversationId: string
  message: { id: string; role: 'assistant'; content: string; createdAt: string }
  plan: string[]
  model: { id: string; provider: string; label: string; tier: string }
  confidence: number
  trust: { confidence:number; evidence:{contextItems:number;sourceCount:number}; verification:{status:string;deterministic:boolean} }
  contextItems: number
  durationMs: number
}

export interface ProjectRecord {id:string;name:string;description:string;status:'active'|'archived';createdAt:string;updatedAt:string}
export interface MemoryRecord {id:string;content:string;kind:string;importance:number;projectId?:string;createdAt:string}
export interface FileRecord {id:string;name:string;mimeType:string;size:number;checksum:string;projectId?:string;createdAt:string}
export interface MissionRecord {id:string;goal:string;status:string;progress:number;createdAt:string;updatedAt:string;contract?:{phase:string;autonomy:string};tasks?:MissionTaskRecord[]}
export interface MissionTaskRecord {id:string;key:string;title:string;kind:string;status:string;progress:number;attempts:number;dependsOn:string[];output?:Record<string,unknown>;error?:string}
export interface ConversationRecord {id:string;title:string;projectId?:string;createdAt:string;updatedAt:string}
export interface AuditRecord {id:string;action:string;resource?:string;metadata?:Record<string,unknown>;createdAt:string}

const storage = typeof window === 'undefined' ? null : window.localStorage

class ApiClient {
  private token = storage?.getItem(TOKEN_KEY) ?? null
  private refreshToken=storage?.getItem(REFRESH_KEY)??null

  private async session() {
    if (this.token) return this.token
    const response = await fetch('/api/v1/auth/guest', { method: 'POST' })
    if (!response.ok) throw new Error('Não foi possível iniciar uma sessão segura.')
    const data = await response.json() as { token: string }
    this.token = data.token
    storage?.setItem(TOKEN_KEY, data.token)
    return data.token
  }

  private applySession(data:{token?:string;accessToken?:string;refreshToken?:string}){this.token=data.accessToken??data.token??null;if(this.token)storage?.setItem(TOKEN_KEY,this.token);if(data.refreshToken){this.refreshToken=data.refreshToken;storage?.setItem(REFRESH_KEY,data.refreshToken)}}
  private clearSession(){this.token=null;this.refreshToken=null;storage?.removeItem(TOKEN_KEY);storage?.removeItem(REFRESH_KEY)}
  private async renew(){if(!this.refreshToken)return false;const response=await fetch('/api/v1/auth/refresh',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({refreshToken:this.refreshToken})});if(!response.ok){this.clearSession();throw new Error('Sua sessão expirou. Entre novamente.')}this.applySession(await response.json());return true}
  private async request<T>(path: string, options: RequestInit = {},retried=false): Promise<T> {
    const token = await this.session()
    const response = await fetch(path, {...options,headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...options.headers }})
    if(response.status===401&&!retried){if(!await this.renew()){this.token=null;storage?.removeItem(TOKEN_KEY);await this.session()}return this.request<T>(path,options,true)}
    const body = response.status === 204 ? undefined : await response.json()
    if (!response.ok) throw new Error(body?.error?.message ?? 'Falha ao comunicar com a Singularity API.')
    return body as T
  }

  async register(name:string,email:string,password:string){const response=await fetch('/api/v1/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,email,password})}),body=await response.json();if(!response.ok)throw new Error(body?.error?.message??'Falha no cadastro.');this.applySession(body);return body.user as {id:string;name:string;email:string}}
  async login(email:string,password:string){const response=await fetch('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})}),body=await response.json();if(!response.ok)throw new Error(body?.error?.message??'Falha no login.');this.applySession(body);return body.user as {id:string;name:string;email:string}}
  async requestPasswordReset(email:string){const response=await fetch('/api/v1/auth/password-reset/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email})}),body=await response.json();if(!response.ok)throw new Error(body?.error?.message??'Falha na recuperação.');return body as {message:string;developmentResetToken?:string}}
  async confirmPasswordReset(token:string,password:string){const response=await fetch('/api/v1/auth/password-reset/confirm',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,password})}),body=await response.json();if(!response.ok)throw new Error(body?.error?.message??'Falha ao redefinir senha.');return body as {message:string}}
  me(){return this.request<{user:{id:string;name:string;email?:string;guest:boolean}}>('/api/v1/auth/me')}
  async logout(){if(this.refreshToken)await fetch('/api/v1/auth/logout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({refreshToken:this.refreshToken})}).catch(()=>undefined);this.clearSession()}
  recordPuterExecution(input:{conversationId?:string;prompt:string;response:string;provider:string;modelId:string;durationMs:number;startedAt:string;fallbackChain:{provider:string;modelId:string;error:string}[]}){return this.request<{conversationId:string;message:{content:string};report:{id:string;receipt:string};trust:{execution:string;providerAttested:boolean}}>(`/api/v1/puter/executions`,{method:'POST',body:JSON.stringify(input)})}
  chat(message: string, mode: 'auto' | 'fast' | 'deep', conversationId?: string) {
    return this.request<ChatResponse>('/api/v1/chat', { method: 'POST', body: JSON.stringify({ message, mode, conversationId }) })
  }
  async chatStream(message: string, mode: 'auto' | 'fast' | 'deep', conversationId: string | undefined, handlers: { delta: (text: string) => void; status?: (message: string) => void }) {
    const token = await this.session()
    const response = await fetch('/api/v1/chat/stream', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ message, mode, conversationId }) })
    if (!response.ok || !response.body) throw new Error('Não foi possível iniciar o streaming.')
    const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let event = 'message'; let result: ChatResponse | undefined
    while (true) {
      const { done, value } = await reader.read(); buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })
      const lines = buffer.split('\n'); buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('event: ')) event = line.slice(7)
        if (!line.startsWith('data: ')) continue
        const data = JSON.parse(line.slice(6))
        if (event === 'delta') handlers.delta(data.content)
        if (event === 'status') handlers.status?.(data.message)
        if (event === 'done') result = data as ChatResponse
        if (event === 'error') throw new Error(data.message)
      }
      if (done) break
    }
    if (!result) throw new Error('Streaming encerrado sem resultado.')
    return result
  }
  observability(){return this.request<any>('/api/v1/observability')}
  releasePackage(projectId:string,name:string,version:string,releaseNotes?:string){return this.request<any>(`/api/v1/projects/${projectId}/release-package`,{method:'POST',body:JSON.stringify({name,version,releaseNotes})})}
  integrationMatrix(){return this.request<{data:{id:number;name:string;kind:string;state:string;evidence:string;next?:string}[];summary:Record<string,number>}>('/api/v1/integrations/matrix')}
  v1Gaps(area?:string){return this.request<{data:{id:string;area:string;name:string;state:string;dependency:string;activation:string}[];summary:Record<string,number>}>(`/api/v1/v1-gaps${area?`?area=${encodeURIComponent(area)}`:''}`)}
  sandboxValidate(language:'javascript'|'typescript'|'json',source:string){return this.request<{valid:boolean;stage:string;durationMs:number;findings:{id:string;severity:string}[];stdout:string;stderr:string;executedUserCode:boolean}>('/api/v1/sandbox/validate',{method:'POST',body:JSON.stringify({language,source})})}
  tools() { return this.request<{ data: {id:string;name:string;description:string;category:string;risk:string;status:string;permissions:string[];verifier:string}[];physicalExecutionEnabled:boolean }>('/api/v1/tools') }
  executeTool(toolId:string,input:Record<string,unknown>,approvalId?:string){return this.request<{id:string;status:string;output?:Record<string,unknown>;verification?:{verified?:boolean};receipt?:string}>(`/api/v1/tools/${toolId}/execute`,{method:'POST',body:JSON.stringify({input,approvalId})})}
  modelStatus() { return this.request<{ puter: { total: number; providers: string[]; providerCount: number; evaluated: number; unranked: number } }>('/api/v1/models') }
  createBenchmarkProposal(projectId:string,capability:'chat'|'reasoning'|'code'|'research'|'vision'|'creative'|'planning',version:string){return this.request<any>('/api/v1/benchmarks/proposals',{method:'POST',body:JSON.stringify({projectId,capability,version})})}
  createBenchmarkCampaign(capability: 'chat'|'reasoning'|'code'|'research'|'vision'|'creative'|'planning', benchmarkVersion: string) { return this.request<{ campaign: { id: string; totalJobs: number }; coverage: { eligible: number } }>('/api/v1/benchmarks/campaigns', { method: 'POST', body: JSON.stringify({ capability, benchmarkVersion }) }) }
  claimBenchmark(campaignId: string) { return this.request<{ job: { id:string; model:{key:string;id:string;provider:string}; suite:{version:string;cases:{id:string;prompt:string;criteria:string[];modality:string}[]} }; claimToken:string; trust:string }>(`/api/v1/benchmarks/campaigns/${campaignId}/claim`, { method:'POST' }) }
  submitBenchmark(jobId:string,claimToken:string,output:Record<string,unknown>,latencyMs:number){return this.request<{status:string;trust:string;tierChanged:boolean}>(`/api/v1/benchmarks/jobs/${jobId}/submit`,{method:'POST',body:JSON.stringify({claimToken,output,latencyMs})})}
  masterPrograms(){return this.request<{data:{id:number;key:string;name:string;state:string;implementedScope:string;evidence:string;nextLevel:string}[];summary:Record<string,number>;rule:string}>('/api/v1/master-intelligence/programs')}
  compileMasterIntelligence(projectId:string,intent:string,constraints:string[]=[]){return this.request<any>('/api/v1/master-intelligence/compile',{method:'POST',body:JSON.stringify({projectId,intent,constraints,autonomy:'SUPERVISED'})})}
  cognitiveHandoffs(missionId:string){return this.request<{data:any[]}>(`/api/v1/master-intelligence/missions/${missionId}/handoffs`)}
  submitCognitiveHandoff(input:{missionId:string;taskId:string;modelKey:string;inputArtifactIds:string[];output:Record<string,unknown>;findings:{code:string;severity:'info'|'warning'|'error';message:string}[]}){return this.request<any>('/api/v1/master-intelligence/handoffs',{method:'POST',body:JSON.stringify(input)})}
  reviewCognitiveHandoff(handoffId:string,input:{reviewerTaskId:string;reviewerModelKey:string;verdict:'accept'|'revise'|'reject';findings:{code:string;severity:'info'|'warning'|'error';message:string}[]}){return this.request<any>(`/api/v1/master-intelligence/handoffs/${handoffId}/reviews`,{method:'POST',body:JSON.stringify(input)})}
  scheduleCognitiveCorrection(handoffId:string){return this.request<any>(`/api/v1/master-intelligence/handoffs/${handoffId}/schedule-correction`,{method:'POST'})}
  verifyCognitiveCorrection(originalHandoffId:string,correctedHandoffId:string){return this.request<any>(`/api/v1/master-intelligence/handoffs/${originalHandoffId}/verify-correction`,{method:'POST',body:JSON.stringify({correctedHandoffId})})}
  createDocuments(input:{projectId:string;name:string;title:string;paragraphs:string[];table?:string[][];formats:('pdf'|'docx'|'xlsx'|'pptx'|'markdown'|'csv')[]}){return this.request<any>('/api/v1/documents',{method:'POST',body:JSON.stringify(input)})}
  verifyDocument(fileId:string){return this.request<any>(`/api/v1/documents/${fileId}/verify`)}
  automations(){return this.request<any>('/api/v1/automations')}
  createAutomation(input:Record<string,unknown>){return this.request<any>('/api/v1/automations',{method:'POST',body:JSON.stringify(input)})}
  emitAutomationEvent(event:string,payload:Record<string,unknown>){return this.request<any>(`/api/v1/automations/events/${encodeURIComponent(event)}`,{method:'POST',body:JSON.stringify(payload)})}
  plugins(){return this.request<any>('/api/v1/plugins')}
  installPlugin(input:Record<string,unknown>){return this.request<any>('/api/v1/plugins',{method:'POST',body:JSON.stringify(input)})}
  branchMission(id:string,input:Record<string,unknown>){return this.request<any>(`/api/v1/missions/${id}/branch`,{method:'POST',body:JSON.stringify(input)})}
  compensateMission(id:string,input:Record<string,unknown>){return this.request<any>(`/api/v1/missions/${id}/compensate`,{method:'POST',body:JSON.stringify(input)})}
  offlineSync(input:Record<string,unknown>){return this.request<any>('/api/v1/offline-sync/operations',{method:'POST',body:JSON.stringify(input)})}
  offlineSyncStatus(){return this.request<any>('/api/v1/offline-sync')}
  analyzeProblem(problem: string) { return this.request<{ classification: string; domains: { id: string; name: string }[]; graphId: string }>('/api/v1/problem-solver/analyze', { method: 'POST', body: JSON.stringify({ problem }) }) }
  compileProblem(problem: string) { return this.request<{ mission: { id: string; status: string }; analysis: { classification: string; domains: { id: string; name: string }[] }; tasks: unknown[] }>('/api/v1/problem-solver/compile', { method: 'POST', body: JSON.stringify({ problem }) }) }
  createMission(goal: string, tasks: { key: string; title: string; kind: string; dependsOn?: string[] }[]) { return this.request<{ mission: MissionRecord; tasks: MissionTaskRecord[] }>('/api/v1/missions', { method: 'POST', body: JSON.stringify({ goal, tasks }) }) }
  missions() { return this.request<{ data: MissionRecord[] }>('/api/v1/missions') }
  mission(id:string){return this.request<{mission:MissionRecord;contract:{phase:string;autonomy:string};tasks:MissionTaskRecord[];events:{id:string;type:string;payload:Record<string,unknown>;createdAt:string}[]}>(`/api/v1/missions/${id}`)}
  missionAction(id:string,action:'pause'|'resume'|'cancel'){return this.request<unknown>(`/api/v1/missions/${id}/${action}`,{method:'POST'})}
  mutateMission(id:string,input:{reason:string;add?:{key:string;title:string;kind:string;dependsOn?:string[];input?:Record<string,unknown>;maxAttempts?:number}[];cancelKeys?:string[]}){return this.request<any>(`/api/v1/missions/${id}/mutate`,{method:'POST',body:JSON.stringify(input)})}
  conversations(){return this.request<{data:ConversationRecord[]}>('/api/v1/conversations')}
  conversationMessages(id:string){return this.request<{data:{id:string;role:string;content:string;createdAt:string;metadata?:Record<string,unknown>}[]}>(`/api/v1/conversations/${id}/messages`)}
  health() { return fetch('/api/health').then(response => response.ok) }
  projects() { return this.request<{ data: ProjectRecord[] }>('/api/v1/projects') }
  createProject(name:string,description=''){return this.request<ProjectRecord>('/api/v1/projects',{method:'POST',body:JSON.stringify({name,description})})}
  updateProject(id:string,update:Partial<Pick<ProjectRecord,'name'|'description'|'status'>>){return this.request<ProjectRecord>(`/api/v1/projects/${id}`,{method:'PATCH',body:JSON.stringify(update)})}
  memories(projectId?:string){return this.request<{data:MemoryRecord[]}>(`/api/v1/memories${projectId?`?projectId=${encodeURIComponent(projectId)}`:''}`)}
  createMemory(content:string,kind:string,importance=50,projectId?:string){return this.request<MemoryRecord>('/api/v1/memories',{method:'POST',body:JSON.stringify({content,kind,importance,projectId})})}
  createKnowledgeMemory(input:{content:string;kind:string;importance:number;projectId?:string;retentionDays?:number;reason?:string}){return this.request<any>('/api/v1/knowledge-memory',{method:'POST',body:JSON.stringify(input)})}
  reviseKnowledgeMemory(memoryId:string,input:{content:string;reason:string;retentionDays?:number}){return this.request<any>(`/api/v1/knowledge-memory/${memoryId}/revisions`,{method:'POST',body:JSON.stringify(input)})}
  invalidateKnowledgeMemoryVersion(versionId:string,reason:string){return this.request<any>(`/api/v1/knowledge-memory/versions/${versionId}/invalidate`,{method:'POST',body:JSON.stringify({reason})})}
  knowledgeMemoryLineage(memoryId:string){return this.request<any>(`/api/v1/knowledge-memory/${memoryId}/lineage`)}
  searchKnowledgeMemory(query:string,projectId?:string){return this.request<any>(`/api/v1/knowledge-memory/search?q=${encodeURIComponent(query)}${projectId?`&projectId=${encodeURIComponent(projectId)}&includeGlobal=true`:''}`)}
  deleteMemory(id:string){return this.request<void>(`/api/v1/memories/${id}`,{method:'DELETE'})}
  files(projectId?:string){return this.request<{data:FileRecord[]}>(`/api/v1/files${projectId?`?projectId=${encodeURIComponent(projectId)}`:''}`)}
  async uploadFile(file:File,projectId?:string){const token=await this.session();const form=new FormData();form.append('file',file);if(projectId)form.append('projectId',projectId);const response=await fetch('/api/v1/files',{method:'POST',headers:{authorization:`Bearer ${token}`},body:form});const body=await response.json();if(!response.ok)throw new Error(body?.error?.message??'Falha no upload.');return body as FileRecord}
  deleteFile(id:string){return this.request<void>(`/api/v1/files/${id}`,{method:'DELETE'})}
  async downloadFile(file:FileRecord){const token=await this.session();const response=await fetch(`/api/v1/files/${file.id}/content`,{headers:{authorization:`Bearer ${token}`}});if(!response.ok)throw new Error('Falha no download.');const url=URL.createObjectURL(await response.blob()),anchor=document.createElement('a');anchor.href=url;anchor.download=file.name;anchor.click();URL.revokeObjectURL(url)}
  audit(limit=100){return this.request<{data:AuditRecord[]}>(`/api/v1/audit?limit=${limit}`)}
  dashboard(){return this.request<{user:{id:string;guest:boolean};counts:{projects:number;conversations:number;memories:number;files:number;missions:number;auditEvents:number};core:{status:string;uptime:number;physicalExecutionEnabled:boolean};puter:{total:number;providerCount:number;evaluated:number;unranked:number};workers:{total:number;online:number}}>('/api/v1/dashboard')}
  settings(){return this.request<{data:Record<string,unknown>}>('/api/v1/settings')}
  updateSettings(settings:Record<string,unknown>){return this.request<{data:Record<string,unknown>;updatedAt:string}>('/api/v1/settings',{method:'PATCH',body:JSON.stringify(settings)})}
  async exportData(){const data=await this.request<Record<string,unknown>>('/api/v1/data-export'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),anchor=document.createElement('a');anchor.href=url;anchor.download=`snb-data-export-${new Date().toISOString().slice(0,10)}.json`;anchor.click();URL.revokeObjectURL(url)}
  approvals(status?:string){return this.request<{data:{id:string;action:string;risk:string;rationale:string;status:string;expiresAt:string}[]}>(`/api/v1/approvals${status?`?status=${encodeURIComponent(status)}`:''}`)}
  requestApproval(action:string,risk:string,rationale:string){return this.request<{id:string}>('/api/v1/approvals',{method:'POST',body:JSON.stringify({action,risk,rationale})})}
  decideApproval(id:string,decision:'approved'|'rejected'){return this.request(`/api/v1/approvals/${id}/decide`,{method:'POST',body:JSON.stringify({decision})})}
  divineOsProjects(){return this.request<{data:any[]}>('/api/v1/divine-os/projects')}
  createDivineOsProject(input:{name:string;variant:string;baseManifest?:Record<string,unknown>;configuration?:Record<string,unknown>}){return this.request<any>('/api/v1/divine-os/projects',{method:'POST',body:JSON.stringify(input)})}
  divineOsProject(id:string){return this.request<any>(`/api/v1/divine-os/projects/${id}`)}
  updateDivineOsBase(id:string,baseManifest:Record<string,unknown>){return this.request<any>(`/api/v1/divine-os/projects/${id}/base`,{method:'PATCH',body:JSON.stringify({baseManifest})})}
  divineOsResourcePlan(id:string,input:{ramMB:number;cpuCores:number;storageMB:number;batteryPowered:boolean}){return this.request<any>(`/api/v1/divine-os/projects/${id}/resource-plan`,{method:'POST',body:JSON.stringify(input)})}
  divineProjects(){return this.request<{data:{id:string;name:string;brief:string;target:string;status:string;missionStatus:string;progress:number;artifactCount:number;bosses:{total:number;completed:number;running:number;failed:number}}[]}>('/api/v1/divine-engine/projects')}
  createDivineProject(input:{name:string;brief:string;target:string;executionPolicy:string;deviceProfile:Record<string,unknown>}){return this.request<any>('/api/v1/divine-engine/projects',{method:'POST',body:JSON.stringify(input)})}
  divineProject(id:string){return this.request<any>(`/api/v1/divine-engine/projects/${id}`)}
  generateDivinePrototype(id:string,prompt?:string){return this.request<any>(`/api/v1/divine-engine/projects/${id}/prototype-3d`,{method:'POST',body:JSON.stringify({prompt})})}
  buildDivinePrototype(projectId:string,prompt:string,name:string){return this.request<any>('/api/v1/divine-engine/prototype-pipeline',{method:'POST',body:JSON.stringify({projectId,prompt,name})})}
  buildExperimental4D(projectId:string,name:string){return this.request<any>('/api/v1/divine-engine/experimental-4d',{method:'POST',body:JSON.stringify({projectId,name})})}
  buildUesCore(projectId:string,name:string,seed:string){return this.request<any>('/api/v1/ues/core/build',{method:'POST',body:JSON.stringify({projectId,name,seed})})}
  buildUesAdvanced(projectId:string,name:string,prompt:string){return this.request<any>('/api/v1/ues/advanced/build',{method:'POST',body:JSON.stringify({projectId,name,prompt})})}
  divineSettingsRegistry(){return this.request<any>('/api/v1/divine-engine/settings-registry')}
  divineProjectSettings(id:string){return this.request<any>(`/api/v1/divine-engine/projects/${id}/settings`)}
  updateDivineProjectSettings(id:string,changes:Record<string,unknown>){return this.request<any>(`/api/v1/divine-engine/projects/${id}/settings`,{method:'PATCH',body:JSON.stringify({changes})})}
  applyDivinePreset(id:string,preset:string){return this.request<any>(`/api/v1/divine-engine/projects/${id}/presets/${preset}`,{method:'POST'})}
  divineCommands(id:string){return this.request<{data:any[]}>(`/api/v1/divine-engine/projects/${id}/commands`)}
  sendDivineCommand(id:string,message:string,attachmentFileIds:string[]=[]){return this.request<any>(`/api/v1/divine-engine/projects/${id}/commands`,{method:'POST',body:JSON.stringify({message,attachmentFileIds})})}
  createHsdsSession(divineProjectId:string,device:{viewportWidth:number;viewportHeight:number;bandwidthMbps?:number;latencyMs?:number;decodeTier?:'low'|'balanced'|'high';saveData?:boolean}){return this.request<any>('/api/v1/hsds/sessions',{method:'POST',body:JSON.stringify({divineProjectId,device})})}
  hsdsInput(sessionId:string,input:{type:'pointer'|'keyboard'|'gamepad'|'touch';dx?:number;dy?:number;zoom?:number;key?:string}){return this.request<any>(`/api/v1/hsds/sessions/${sessionId}/input`,{method:'POST',body:JSON.stringify(input)})}
  closeHsds(sessionId:string){return this.request<any>(`/api/v1/hsds/sessions/${sessionId}/close`,{method:'POST'})}
  async hsdsFrames(sessionId:string){const token=await this.session(),response=await fetch(`/api/v1/hsds/sessions/${sessionId}/stream`,{headers:{authorization:`Bearer ${token}`}});if(!response.ok)throw new Error((await response.json())?.error?.message??'Falha no stream HSDS.');const text=await response.text(),frames:any[]=[];for(const block of text.split('\n\n')){if(!block.includes('event: frame'))continue;const line=block.split('\n').find(item=>item.startsWith('data: '));if(line)frames.push(JSON.parse(line.slice(6)))}return frames}
  async previewFile(file:FileRecord){const token=await this.session(),response=await fetch(`/api/v1/files/${file.id}/content`,{headers:{authorization:`Bearer ${token}`}});if(!response.ok)throw new Error('Falha no preview.');return URL.createObjectURL(await response.blob())}
  artifactGraph(projectId:string){return this.request<any>(`/api/v1/artifact-graph/${projectId}`)}
  synthesize3DPipeline(goal:string){return this.request<{goal:string;pipeline:string;executable:boolean;stages:{id:string;capability:string;status:string;selected?:{name:string;version:string};candidates:{name:string;status:string}[]}[];gaps:string[];rule:string}>('/api/v1/capability-fabric/pipeline/3d',{method:'POST',body:JSON.stringify({goal})})}
  capabilityManifests(){return this.request<{data:{id:string;name:string;version:string;type:string;capabilities:string[];status:string;license:string;reliability:number}[]}>('/api/v1/capability-fabric')}
  researchPlan(query:string,modelCount=4){return this.request<{query:string;policy:string;eligibleTotal:number;researchers:{key:string;id:string;provider:string;name?:string}[];synthesizer:{key:string;id:string;provider:string;name?:string};warning:string}>('/api/v1/research/plan',{method:'POST',body:JSON.stringify({query,modelCount})})}
  evidenceGraph(){return this.request<{claims:{id:string;statement:string;state:string;confidence:number}[];sources:{id:string;url:string;title:string;publisher?:string;status:string}[];links:{id:string;claimId:string;sourceId:string;relation:string;strength:number}[];summary:Record<string,number>}>('/api/v1/evidence-graph')}
  addSource(input:{url:string;title:string;publisher?:string}){return this.request<{id:string}>('/api/v1/evidence/sources',{method:'POST',body:JSON.stringify(input)})}
  addClaim(statement:string){return this.request<{id:string;state:string}>('/api/v1/evidence/claims',{method:'POST',body:JSON.stringify({statement})})}
  linkEvidence(input:{claimId:string;sourceId:string;relation:'supports'|'contradicts'|'context';strength:number;quote?:string}){return this.request('/api/v1/evidence/links',{method:'POST',body:JSON.stringify(input)})}
}

export const api = new ApiClient()
