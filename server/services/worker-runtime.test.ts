import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { MissionEngine } from './mission-engine.js'
import { ToolEcosystem } from './tool-ecosystem.js'
import { PersistentWorkerRuntime, WorkerCoordinator } from './worker-runtime.js'

let store:SQLiteStore;let missions:MissionEngine;let tools:ToolEcosystem;let coordinator:WorkerCoordinator
beforeEach(()=>{store=new SQLiteStore(':memory:');missions=new MissionEngine(store);tools=new ToolEcosystem(store,'test-receipt-secret-with-more-than-32-chars',false);coordinator=new WorkerCoordinator(store,30)})
afterEach(()=>store.close())

describe('Persistent Worker Runtime',()=>{
  it('executes dependency-gated deterministic tool tasks to completion',async()=>{
    const created=missions.create('worker-user','Calculate and inspect',[{key:'math',title:'Calculate',kind:'tool:core.math.aggregate',input:{operation:'sum',values:[2,3]}},{key:'text',title:'Inspect text',kind:'tool:core.text.metrics',dependsOn:['math'],input:{text:'Singularity'}}])
    const worker=coordinator.register('worker-test','Test Tool Worker',['tool']);const runtime=new PersistentWorkerRuntime(worker.id,coordinator,store,missions,tools)
    expect(await runtime.processOne()).toBe(true);expect(missions.detail('worker-user',created.mission.id).tasks[0].status).toBe('completed')
    expect(await runtime.processOne()).toBe(true);const detail=missions.detail('worker-user',created.mission.id);expect(detail.mission.status).toBe('completed');expect(detail.tasks.every(task=>task.status==='completed')).toBe(true)
  })

  it('recovers expired leases and fails after bounded attempts',()=>{
    const created=missions.create('worker-user','Lease recovery',[{key:'job',title:'Job',kind:'tool:core.text.metrics',input:{text:'x'},maxAttempts:2}]);const worker=coordinator.register('worker-recovery','Recovery Worker',['tool'])
    coordinator.claim(worker.id);let result=store.recoverExpiredTaskLeases(new Date(Date.now()+60_000).toISOString());expect(result.recovered).toBe(1);expect(missions.detail('worker-user',created.mission.id).tasks[0].status).toBe('pending')
    coordinator.claim(worker.id);result=store.recoverExpiredTaskLeases(new Date(Date.now()+120_000).toISOString());expect(result.failed).toBe(1);expect(missions.detail('worker-user',created.mission.id).tasks[0].status).toBe('failed')
  })

  it('reuses a completed tool execution after a crash boundary',async()=>{
    const created=missions.create('worker-user','Idempotent recovery',[{key:'metric',title:'Metric',kind:'tool:core.text.metrics',input:{text:'once'}}]);const task=created.tasks[0]
    const prior=await tools.execute('worker-user','core.text.metrics',{text:'once'},{missionId:created.mission.id,taskId:task.id})
    const worker=coordinator.register('worker-idempotent','Idempotent Worker',['tool']);const runtime=new PersistentWorkerRuntime(worker.id,coordinator,store,missions,tools);await runtime.processOne()
    const detail=missions.detail('worker-user',created.mission.id);expect(detail.mission.status).toBe('completed');expect((detail.tasks[0].output as {toolExecutionId:string}).toolExecutionId).toBe(prior.id);expect(tools.history('worker-user')).toHaveLength(1)
  })
})
