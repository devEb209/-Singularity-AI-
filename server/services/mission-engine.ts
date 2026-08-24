import type { AutonomyLevel, FailureCategory, Mission, MissionContract, MissionEvent, MissionPhase, MissionTask } from '../domain.js'
import { AppError, NotFoundError } from '../lib/errors.js'
import { id, now } from '../lib/id.js'
import type { Store } from '../repositories/store.js'

export interface TaskDefinition { key: string; title: string; kind: string; dependsOn?: string[]; input?: Record<string, unknown>; maxAttempts?: number }
export interface MissionContractInput { userIntent?:string;constraints?:string[];requiredCapabilities?:string[];availableResources?:string[];risks?:string[];successCriteria?:string[];verificationRequirements?:string[];finalDeliverable?:string;autonomy?:AutonomyLevel }

export class MissionEngine {
  constructor(private store: Store) {}

  create(userId: string, goal: string, definitions: TaskDefinition[], projectId?: string, input:MissionContractInput={}) {
    if (projectId) this.store.getProject(projectId, userId)
    this.validateDag(definitions)
    const timestamp = now(); const missionId = id('mission')
    const mission: Mission = { id: missionId, userId, projectId, goal, status: 'pending', progress: 0, createdAt: timestamp, updatedAt: timestamp }
    const contract:MissionContract={missionId,objective:goal,userIntent:input.userIntent??goal,constraints:input.constraints??[],requiredCapabilities:input.requiredCapabilities??[...new Set(definitions.map(item=>item.kind))],availableResources:input.availableResources??[],risks:input.risks??[],successCriteria:input.successCriteria??['Todas as tarefas concluídas','Verificações obrigatórias aprovadas'],verificationRequirements:input.verificationRequirements??['Validar saídas conforme critérios de cada tarefa'],finalDeliverable:input.finalDeliverable??'Resultado verificável da missão',autonomy:input.autonomy??'SUPERVISED',phase:'CREATED',createdAt:timestamp,updatedAt:timestamp}
    const tasks: MissionTask[] = definitions.map(definition => ({ id: id('task'), missionId, key: definition.key, title: definition.title, kind: definition.kind, status: 'pending', dependsOn: definition.dependsOn ?? [], input: definition.input ?? {}, progress: 0, attempts: 0, maxAttempts: definition.maxAttempts ?? 3, createdAt: timestamp, updatedAt: timestamp }))
    const event = this.event(missionId, 'mission.created', { goal, taskCount: tasks.length,autonomy:contract.autonomy })
    this.store.createMission(mission,contract,tasks,event)
    return { mission,contract,tasks, ready: this.ready(tasks) }
  }

  detail(userId: string, missionId: string) { const mission = this.store.getMission(missionId, userId); const tasks = this.store.listMissionTasks(missionId); return { mission,contract:this.store.getMissionContract(missionId), tasks, ready: this.ready(tasks), events: this.store.listMissionEvents(missionId) } }
  list(userId: string) { return this.store.listMissions(userId).map(mission => ({ ...mission, tasks: this.store.listMissionTasks(mission.id) })) }

  startTask(userId: string, missionId: string, taskId: string) {
    const { mission, tasks } = this.ownedTask(userId, missionId, taskId); const task = tasks.find(item => item.id === taskId)!
    if (mission.status === 'cancelled' || mission.status === 'completed') throw new AppError('A missão não aceita novas execuções.', 409, 'MISSION_CLOSED')
    if (task.status !== 'pending') throw new AppError('A tarefa não está pendente.', 409, 'TASK_NOT_PENDING')
    const completed = new Set(tasks.filter(item => item.status === 'completed').map(item => item.key))
    const missing = task.dependsOn.filter(dependency => !completed.has(dependency))
    if (missing.length) throw new AppError('Dependências ainda não concluídas.', 409, 'TASK_DEPENDENCIES_PENDING', missing)
    task.status = 'running'; task.attempts++; task.progress = Math.max(task.progress, 1); task.updatedAt = now(); this.store.updateMissionTask(task)
    mission.status = 'running'; mission.updatedAt = task.updatedAt; this.store.updateMission(mission);this.setPhase(missionId,this.phaseForTask(task.kind)); this.store.addMissionEvent(this.event(missionId, 'task.started', { attempt: task.attempts,phase:this.store.getMissionContract(missionId).phase }, task.id))
    return task
  }

  completeTask(userId: string, missionId: string, taskId: string, output: Record<string, unknown>) {
    const { mission, tasks } = this.ownedTask(userId, missionId, taskId); const task = tasks.find(item => item.id === taskId)!
    if (task.status !== 'running') throw new AppError('Apenas tarefas em execução podem ser concluídas.', 409, 'TASK_NOT_RUNNING')
    task.status = 'completed'; task.progress = 100; task.output = output; task.error = undefined; task.updatedAt = now(); this.store.updateMissionTask(task); this.store.addMissionEvent(this.event(missionId, 'task.completed', { output }, task.id))
    return this.recompute(mission, this.store.listMissionTasks(missionId))
  }

  failTask(userId: string, missionId: string, taskId: string, reason: string, retryable: boolean,category:FailureCategory='EXECUTION_FAILURE') {
    const { mission, tasks } = this.ownedTask(userId, missionId, taskId); const task = tasks.find(item => item.id === taskId)!
    if (task.status !== 'running') throw new AppError('Apenas tarefas em execução podem falhar.', 409, 'TASK_NOT_RUNNING')
    const willRetry = retryable && task.attempts < task.maxAttempts
    task.status = willRetry ? 'pending' : 'failed'; task.error = reason; task.updatedAt = now(); this.store.updateMissionTask(task)
    this.setPhase(missionId,willRetry?'RECOVERING':'FAILED');this.store.addMissionEvent(this.event(missionId, willRetry ? 'task.retry_scheduled' : 'task.failed', { reason,category, attempt: task.attempts, maxAttempts: task.maxAttempts }, task.id))
    return this.recompute(mission, this.store.listMissionTasks(missionId))
  }

  cancel(userId: string, missionId: string) {
    const mission = this.store.getMission(missionId, userId)
    if (mission.status === 'completed') throw new AppError('Missão concluída não pode ser cancelada.', 409, 'MISSION_COMPLETED')
    for (const task of this.store.listMissionTasks(missionId)) if (task.status === 'pending' || task.status === 'running') { task.status = 'cancelled'; task.updatedAt = now(); this.store.updateMissionTask(task) }
    mission.status = 'cancelled'; mission.updatedAt = now(); this.store.updateMission(mission);this.setPhase(missionId,'CANCELLED'); this.store.addMissionEvent(this.event(missionId, 'mission.cancelled', {})); return mission
  }
  pause(userId:string,missionId:string){const mission=this.store.getMission(missionId,userId);if(!['pending','running'].includes(mission.status))throw new AppError('Missão não pode ser pausada neste estado.',409,'MISSION_NOT_PAUSABLE');mission.status='paused';mission.updatedAt=now();this.store.updateMission(mission);this.setPhase(missionId,'PAUSED');this.store.addMissionEvent(this.event(missionId,'mission.paused',{}));return{mission,contract:this.store.getMissionContract(missionId)}}
  mutate(userId:string,missionId:string,input:{reason:string;add?:TaskDefinition[];cancelKeys?:string[]}){const mission=this.store.getMission(missionId,userId);if(['completed','cancelled','failed'].includes(mission.status))throw new AppError('Missão encerrada não pode ser replanejada.',409,'MISSION_CLOSED');const current=this.store.listMissionTasks(missionId),add=input.add??[],cancelKeys=[...new Set(input.cancelKeys??[])];if(!add.length&&!cancelKeys.length)throw new AppError('A mutação deve adicionar ou cancelar tarefas.',400,'EMPTY_WORKFLOW_MUTATION');const byKey=new Map(current.map(task=>[task.key,task]));for(const key of cancelKeys){const task=byKey.get(key);if(!task)throw new AppError(`Tarefa inexistente: ${key}.`,400,'UNKNOWN_MUTATION_TASK');if(task.status!=='pending')throw new AppError(`Somente tarefas pendentes podem ser canceladas: ${key}.`,409,'TASK_NOT_CANCELLABLE')}const futureDefinitions:TaskDefinition[]=[...current.filter(task=>!cancelKeys.includes(task.key)).map(task=>({key:task.key,title:task.title,kind:task.kind,dependsOn:task.dependsOn,input:task.input,maxAttempts:task.maxAttempts})),...add];this.validateDag(futureDefinitions);const timestamp=now(),added:MissionTask[]=add.map(definition=>({id:id('task'),missionId,key:definition.key,title:definition.title,kind:definition.kind,status:'pending',dependsOn:definition.dependsOn??[],input:definition.input??{},progress:0,attempts:0,maxAttempts:definition.maxAttempts??3,createdAt:timestamp,updatedAt:timestamp})),cancelledIds=cancelKeys.map(key=>byKey.get(key)!.id),event=this.event(missionId,'mission.workflow_mutated',{reason:input.reason,added:added.map(task=>task.key),cancelled:cancelKeys,previousTaskCount:current.length,nextTaskCount:futureDefinitions.length});this.store.mutateMissionTasks(missionId,added,cancelledIds,event);const tasks=this.store.listMissionTasks(missionId),active=tasks.filter(task=>task.status!=='cancelled'),completed=active.filter(task=>task.status==='completed').length;mission.progress=active.length?Math.round(completed/active.length*100):0;mission.updatedAt=timestamp;this.store.updateMission(mission);this.setPhase(missionId,'REPLANNING');return{mission,contract:this.store.getMissionContract(missionId),tasks,ready:this.ready(tasks),mutation:event.payload}}
  resume(userId:string,missionId:string){const mission=this.store.getMission(missionId,userId);if(mission.status!=='paused')throw new AppError('Missão não está pausada.',409,'MISSION_NOT_PAUSED');const tasks=this.store.listMissionTasks(missionId);mission.status=tasks.some(task=>task.status==='running')?'running':'pending';mission.updatedAt=now();this.store.updateMission(mission);this.setPhase(missionId,'REPLANNING');this.store.addMissionEvent(this.event(missionId,'mission.resumed',{}));return{mission,contract:this.store.getMissionContract(missionId),ready:this.ready(tasks)}}

  private recompute(mission: Mission, tasks: MissionTask[]) {
    const completed = tasks.filter(task => task.status === 'completed').length; mission.progress = Math.round(completed / tasks.length * 100)
    const wasPaused=mission.status==='paused';mission.status = tasks.every(task => task.status === 'completed') ? 'completed' : tasks.some(task => task.status === 'failed') ? 'failed' : wasPaused?'paused':tasks.some(task => task.status === 'running') ? 'running' : 'pending'; mission.updatedAt = now(); this.store.updateMission(mission)
    if(mission.status==='completed')this.setPhase(mission.id,'COMPLETED');else if(mission.status==='failed')this.setPhase(mission.id,'FAILED')
    if (mission.status === 'completed' || mission.status === 'failed') this.store.addMissionEvent(this.event(mission.id, `mission.${mission.status}`, { progress: mission.progress }))
    return { mission, tasks, ready: this.ready(tasks) }
  }
  private ownedTask(userId: string, missionId: string, taskId: string) { const mission = this.store.getMission(missionId, userId); const tasks = this.store.listMissionTasks(missionId); if (!tasks.some(task => task.id === taskId)) throw new NotFoundError('Tarefa'); return { mission, tasks } }
  private ready(tasks: MissionTask[]) { const completed = new Set(tasks.filter(task => task.status === 'completed').map(task => task.key)); return tasks.filter(task => task.status === 'pending' && task.dependsOn.every(dependency => completed.has(dependency))) }
  private event(missionId: string, type: string, payload: Record<string, unknown>, taskId?: string): MissionEvent { return { id: id('evt'), missionId, taskId, type, payload, createdAt: now() } }
  private setPhase(missionId:string,phase:MissionPhase){const contract=this.store.getMissionContract(missionId);contract.phase=phase;contract.updatedAt=now();this.store.updateMissionContract(contract)}
  private phaseForTask(kind:string):MissionPhase{return kind.includes('planning')?'PLANNING':kind.includes('verification')||kind.includes('verify')?'VERIFYING':kind.includes('analysis')||kind.includes('research')?'ANALYZING':'EXECUTING'}
  private validateDag(tasks: TaskDefinition[]) {
    if (!tasks.length || tasks.length > 200) throw new AppError('A missão deve conter entre 1 e 200 tarefas.', 400, 'INVALID_TASK_COUNT')
    const keys = new Set(tasks.map(task => task.key)); if (keys.size !== tasks.length) throw new AppError('As chaves das tarefas devem ser únicas.', 400, 'DUPLICATE_TASK_KEY')
    for (const task of tasks) for (const dependency of task.dependsOn ?? []) if (!keys.has(dependency)) throw new AppError(`Dependência inexistente: ${dependency}.`, 400, 'UNKNOWN_TASK_DEPENDENCY')
    const visiting = new Set<string>(); const visited = new Set<string>(); const byKey = new Map(tasks.map(task => [task.key, task]))
    const visit = (key: string) => { if (visiting.has(key)) throw new AppError('O grafo de tarefas contém um ciclo.', 400, 'CYCLIC_TASK_GRAPH'); if (visited.has(key)) return; visiting.add(key); for (const dependency of byKey.get(key)?.dependsOn ?? []) visit(dependency); visiting.delete(key); visited.add(key) }
    for (const key of keys) visit(key)
  }
}
