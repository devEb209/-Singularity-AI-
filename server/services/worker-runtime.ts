import { createHash, randomBytes } from 'node:crypto'
import type { Store } from '../repositories/store.js'
import { AppError, NotFoundError } from '../lib/errors.js'
import { id, now } from '../lib/id.js'
import type { MissionEngine } from './mission-engine.js'
import type { ToolEcosystem } from './tool-ecosystem.js'

const hash = (value:string)=>createHash('sha256').update(value).digest('hex')

export class WorkerCoordinator {
  constructor(private store:Store,private leaseSeconds=30){}
  register(workerId:string|undefined,name:string,capabilities:string[]){const existing=workerId?this.store.getWorker(workerId):undefined;const timestamp=now();const worker={id:existing?.id??workerId??id('worker'),name,capabilities:[...new Set(capabilities)],status:'online' as const,lastHeartbeatAt:timestamp,createdAt:existing?.createdAt??timestamp};this.store.upsertWorker(worker);return worker}
  heartbeat(workerId:string){const worker=this.store.getWorker(workerId);if(!worker)throw new NotFoundError('Worker');worker.lastHeartbeatAt=now();worker.status='online';this.store.upsertWorker(worker);return worker}
  claim(workerId:string){const worker=this.heartbeat(workerId);const token=randomBytes(48).toString('base64url'),timestamp=now(),expiresAt=new Date(Date.now()+this.leaseSeconds*1000).toISOString();const claimed=this.store.claimReadyTask(worker.id,worker.capabilities,hash(token),expiresAt,timestamp);return claimed?{...claimed,leaseToken:token}:undefined}
  renew(workerId:string,taskId:string,leaseToken:string){const timestamp=now(),expiresAt=new Date(Date.now()+this.leaseSeconds*1000).toISOString();return this.store.heartbeatTaskLease(taskId,workerId,hash(leaseToken),expiresAt,timestamp)}
  release(workerId:string,taskId:string){this.store.releaseTaskLease(taskId,workerId)}
  recover(){return this.store.recoverExpiredTaskLeases(now())}
  list(){return this.store.listWorkers()}
  drain(workerId:string){const worker=this.store.getWorker(workerId);if(!worker)throw new NotFoundError('Worker');worker.status='draining';worker.lastHeartbeatAt=now();this.store.upsertWorker(worker);return worker}
}

export class PersistentWorkerRuntime {
  private stopped=false
  constructor(private workerId:string,private coordinator:WorkerCoordinator,private store:Store,private missions:MissionEngine,private tools:ToolEcosystem){}
  stop(){this.stopped=true;this.coordinator.drain(this.workerId)}
  async run(pollMs=1000){while(!this.stopped){const worked=await this.processOne();if(!worked)await new Promise(resolve=>setTimeout(resolve,pollMs))}}
  async processOne(){this.coordinator.recover();const claim=this.coordinator.claim(this.workerId);if(!claim)return false;const{mission,task}=claim
    try{
      if(!task.kind.startsWith('tool:'))throw new AppError(`Worker não suporta kind ${task.kind}.`,409,'UNSUPPORTED_WORKER_TASK')
      const previous=this.store.findCompletedToolExecutionByTask(task.id)
      if(previous){this.missions.completeTask(mission.userId,mission.id,task.id,{toolExecutionId:previous.id,idempotentReplay:true,output:previous.output});this.coordinator.release(this.workerId,task.id);return true}
      const toolId=task.kind.slice(5);const nested=task.input.input;const input=nested&&typeof nested==='object'&&!Array.isArray(nested)?nested as Record<string,unknown>:task.input
      const execution=await this.tools.execute(mission.userId,toolId,input,{missionId:mission.id,taskId:task.id,approvalId:typeof task.input.approvalId==='string'?task.input.approvalId:undefined})
      this.missions.completeTask(mission.userId,mission.id,task.id,{toolExecutionId:execution.id,receipt:execution.receipt,output:execution.output});this.coordinator.release(this.workerId,task.id);return true
    }catch(error){const reason=error instanceof Error?error.message:'Worker task failed';try{this.missions.failTask(mission.userId,mission.id,task.id,reason,true,'TOOL_FAILURE')}finally{this.coordinator.release(this.workerId,task.id)}return true}
  }
}
