import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { CapabilityFabric } from './capability-fabric.js'

let store:SQLiteStore,fabric:CapabilityFabric
beforeEach(()=>{store=new SQLiteStore(':memory:');fabric=new CapabilityFabric(store)})
afterEach(()=>store.close())

describe('Universal Capability Fabric',()=>{
  it('discovers only tools that actually exist and keeps them in testing',async()=>{const result=await fabric.discoverEnvironment();expect(result.discovered.some(item=>item.id==='cli.python')).toBe(true);expect(result.discovered.every(item=>item.status==='testing')).toBe(true);expect(result.missing.some(item=>item.id==='software.blender')).toBe(true)})
  it('reports honest 3D pipeline gaps instead of claiming generation',()=>{const pipeline=fabric.synthesize3D('AAA character for Unreal');expect(pipeline.executable).toBe(false);expect(pipeline.gaps).toContain('3d.generate');expect(pipeline.gaps).toContain('animation.motion')})
  it('requires license and evidence before activation',()=>{const manifest=fabric.register({id:'api.test-3d',name:'Test 3D Adapter',version:'1.0.0',vendor:'test',type:'api',capabilities:['3d.generate'],inputs:{prompt:'string'},outputs:{mesh:'artifact'},executionMethods:['https'],authentication:['api-key'],permissions:['external'],dependencies:[],limits:{},license:'UNVERIFIED',risk:'medium',compatibility:['snb'],status:'testing',metadata:{}});expect(()=>fabric.validate(manifest.id,{license:'UNVERIFIED',reliability:90,evidenceCount:3,activate:true})).toThrow();fabric.validate(manifest.id,{license:'Test-License',reliability:90,evidenceCount:3,activate:true});const pipeline=fabric.synthesize3D('character');expect(pipeline.stages.find(stage=>stage.capability==='3d.generate')?.status).toBe('ready');expect(pipeline.executable).toBe(false)})
})
