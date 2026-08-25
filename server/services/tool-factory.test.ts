import { afterEach,beforeEach,describe,expect,it } from 'vitest'
import { rm } from 'node:fs/promises'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { ArtifactGraphService } from './artifact-graph.js'
import { CapabilityFabric } from './capability-fabric.js'
import { CodeValidationSandbox } from './code-sandbox.js'
import { ToolFactory } from './tool-factory.js'
const root='./data/test-tool-factory';let store:SQLiteStore,factory:ToolFactory
beforeEach(()=>{store=new SQLiteStore(':memory:');const graph=new ArtifactGraphService(store),fabric=new CapabilityFabric(store);factory=new ToolFactory(store,graph,fabric,new CodeValidationSandbox(`${root}/sandbox`),`${root}/uploads`)})
afterEach(async()=>{store.close();await rm(root,{recursive:true,force:true})})
describe('SNB Tool Factory',()=>{it('generates, typechecks, tests and registers a reusable tool as testing',async()=>{const project=store.createProject('user','Tool','factory'),result=await factory.create('user',{projectId:project.id,id:'snb.tool.rename',name:'Rename Tool',capability:'data.rename',operations:[{type:'rename',from:'old',to:'next'},{type:'constant',key:'version',value:1}],tests:[{input:{old:'value'},expected:{next:'value',version:1}},{input:{old:42},expected:{next:42,version:1}},{input:{old:false},expected:{next:false,version:1}}]});expect(result.status).toBe('testing');expect(result.validation.valid).toBe(true);expect(result.tests.every(item=>item.passed)).toBe(true);expect(result.artifacts).toHaveLength(2);expect(result.manifest.capabilities).toContain('data.rename');expect(result.manifest.status).toBe('testing')});it('refuses generated tools whose declared tests fail',async()=>{const project=store.createProject('user','Tool','factory');await expect(factory.create('user',{projectId:project.id,id:'snb.tool.bad',name:'Bad',capability:'bad',operations:[{type:'pick',key:'x'}],tests:[{input:{x:1},expected:{x:2}}]})).rejects.toThrow()})})
