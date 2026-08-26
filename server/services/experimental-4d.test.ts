import { afterEach,beforeEach,describe,expect,it } from 'vitest'
import { readFile,rm } from 'node:fs/promises'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { ArtifactGraphService } from './artifact-graph.js'
import { Experimental4DService } from './experimental-4d.js'
const root='./data/test-4d';let store:SQLiteStore,service:Experimental4DService
beforeEach(()=>{store=new SQLiteStore(':memory:');service=new Experimental4DService(store,new ArtifactGraphService(store),root)})
afterEach(async()=>{store.close();await rm(root,{recursive:true,force:true})})
describe('Experimental 4D runtime',()=>{it('creates a verified tesseract and interactive offline projection',async()=>{const project=store.createProject('user','4D','math'),result=await service.create('user',{projectId:project.id,name:'tesseract'});expect(result.verification).toMatchObject({valid:true,dimensions:4,vertices:16,edges:32,physicalClaim:false});const file=store.getFile(result.build.file.id,'user'),html=await readFile(file.storagePath,'utf8');expect(html).toContain('Experimental 4D');expect(html).toContain('4D→3D');expect(html).not.toMatch(/https?:\/\//);expect(result.explanation.not).toContain('physical')});it('rejects malformed four-dimensional topology',()=>{const result=service.verify({coordinateSystem:['X','Y','Z','W'],vertices:[[0,0,0]],edges:[]});expect(result.valid).toBe(false);expect(result.errors.length).toBeGreaterThan(0)})})
