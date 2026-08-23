import { mkdtemp,rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach,describe,expect,it } from 'vitest'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { ArtifactGraphService } from './artifact-graph.js'
import { UesCoreRuntime } from './ues-core-runtime.js'

const dirs:string[]=[]
afterEach(async()=>{await Promise.all(dirs.splice(0).map(dir=>rm(dir,{recursive:true,force:true})))})
describe('UES-owned lightweight core runtime',()=>{
 it('executes deterministic world, physics, rig, animation, NPC, VFX and safe optimization',async()=>{const dir=await mkdtemp(join(tmpdir(),'ues-core-'));dirs.push(dir);const store=new SQLiteStore(join(dir,'db.sqlite')),runtime=new UesCoreRuntime(store,new ArtifactGraphService(store),join(dir,'uploads')),project=store.createProject('user','UES Core','runtime');const result=await runtime.build('user',{projectId:project.id,name:'forest',seed:'biological-forest'});expect(result.artifact.status).toBe('verified');expect(result.verification).toMatchObject({valid:true});expect(store.listFiles('user',project.id)).toHaveLength(1);expect(store.listArtifacts('user',project.id)[0].type).toBe('runtime.ues-core');store.close()})
 it('is deterministic, bounds physics, normalizes weights and rolls dependency rewrites forward',()=>{const store=new SQLiteStore(':memory:'),runtime=new UesCoreRuntime(store,new ArtifactGraphService(store));expect(runtime.world('same',8)).toEqual(runtime.world('same',8));expect(runtime.simulatePhysics([{id:'b',position:[0,.1,0],velocity:[0,-5,0],halfExtents:[.5,.5,.5],mass:1,restitution:0}],20).verification.penetrations).toBe(0);expect(runtime.rig({min:[0,0,0],max:[1,2,1]},[[0,0,0],[0,2,0]]).verification.normalized).toBe(true);const optimized=runtime.optimize([{id:'a',checksum:'x',dependencies:[]},{id:'b',checksum:'x',dependencies:[]},{id:'c',checksum:'y',dependencies:['b']}]);expect(optimized).toMatchObject({before:3,after:2,removed:['b'],rollback:false});expect(optimized.resources[1].dependencies).toEqual(['a']);store.close()})
})
