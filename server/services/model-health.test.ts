import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { ModelCatalog } from './model-catalog.js'
import { ModelHealthService } from './model-health.js'

let store:SQLiteStore;let catalog:ModelCatalog;let health:ModelHealthService
beforeEach(()=>{store=new SQLiteStore(':memory:');catalog=new ModelCatalog(store);health=new ModelHealthService(store,5,120000);catalog.syncPuter([{id:'health-fixture',provider:'fixture',modalities:{input:['text'],output:['text']}}]);for(let i=0;i<3;i++)catalog.recordEvaluation('puter:fixture:health-fixture','code',97,`code-health-${i}`,true,100)})
afterEach(()=>store.close())

describe('Model Health Monitoring',()=>{
  it('removes an unhealthy evaluated model and restores it after success',()=>{
    expect(catalog.route('code').candidates).toHaveLength(1)
    for(let i=0;i<5;i++)health.record('puter:fixture:health-fixture',false,500,'execution','provider timeout')
    expect(health.summary('puter:fixture:health-fixture').circuit.state).toBe('open')
    expect(health.routingAllowed('puter:fixture:health-fixture')).toBe(false)
    expect(catalog.route('code').candidates).toHaveLength(0)
    health.record('puter:fixture:health-fixture',true,90,'health-probe')
    expect(health.summary('puter:fixture:health-fixture').circuit.state).toBe('closed')
    expect(catalog.route('code').candidates).toHaveLength(1)
  })
})
