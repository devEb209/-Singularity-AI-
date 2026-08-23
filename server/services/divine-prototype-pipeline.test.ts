import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFile, rm } from 'node:fs/promises'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { ArtifactGraphService } from './artifact-graph.js'
import { DivinePrototypePipeline } from './divine-prototype-pipeline.js'
import { Procedural3DProvider } from './procedural-3d.js'
import { ProceduralPbrProvider } from './procedural-pbr.js'

const root='./data/test-divine-pipeline';let store:SQLiteStore,pipeline:DivinePrototypePipeline
beforeEach(()=>{store=new SQLiteStore(':memory:');const graph=new ArtifactGraphService(store);pipeline=new DivinePrototypePipeline(store,graph,new Procedural3DProvider(store,root),new ProceduralPbrProvider(store,root),root)})
afterEach(async()=>{store.close();await rm(root,{recursive:true,force:true})})

describe('Divine real prototype pipeline',()=>{
 it('produces mesh, six PBR maps, material, scene and offline playable build',async()=>{const project=store.createProject('user','Prototype','real pipeline'),result=await pipeline.build('user',{projectId:project.id,prompt:'neon sci-fi crate',name:'neon-crate'});expect(result.verification.valid).toBe(true);expect(result.mesh.verification.valid).toBe(true);expect(result.material.maps).toHaveLength(6);expect(result.material.verification.requiredMaps).toEqual(['albedo','normal','roughness','metallic','ao','height']);expect(result.graph.summary.verified).toBe(10);expect(result.graph.edges.length).toBeGreaterThanOrEqual(9);const build=store.getFile(result.build.file.id,'user'),html=await readFile(build.storagePath,'utf8');expect(html).toContain('getContext(\'webgl\')');expect(html).not.toMatch(/https?:\/\//);expect(result.build.artifact.verification).toMatchObject({valid:true,selfContained:true,networkRequests:0,interactive:true})})
 it('produces deterministic lightweight textures within the mobile-friendly cap',async()=>{const project=store.createProject('user','PBR','maps'),result=await pipeline.build('user',{projectId:project.id,prompt:'wood material',name:'wood'});for(const map of result.material.maps){expect(map.size).toBeLessThan(10000);const stored=store.getFile(map.id,'user'),data=await readFile(stored.storagePath);expect([...data.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10])}})
})
