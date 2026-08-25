import { afterEach,beforeEach,describe,expect,it } from 'vitest'
import { readFile,rm } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { ArtifactGraphService } from './artifact-graph.js'
import { DivinePrototypePipeline } from './divine-prototype-pipeline.js'
import { Procedural3DProvider } from './procedural-3d.js'
import { ProceduralPbrProvider } from './procedural-pbr.js'
import { ReleasePackager } from './release-packager.js'
const root='./data/test-release';let store:SQLiteStore,graph:ArtifactGraphService,pipeline:DivinePrototypePipeline,packager:ReleasePackager
beforeEach(()=>{store=new SQLiteStore(':memory:');graph=new ArtifactGraphService(store);pipeline=new DivinePrototypePipeline(store,graph,new Procedural3DProvider(store,root),new ProceduralPbrProvider(store,root),root);packager=new ReleasePackager(store,graph,root)})
afterEach(async()=>{store.close();await rm(root,{recursive:true,force:true})})
describe('SNB Release Packager',()=>{it('packages only verified artifacts with manifest, readme, changelog and checksums',async()=>{const project=store.createProject('user','Release','package');await pipeline.build('user',{projectId:project.id,prompt:'release crate',name:'release'});const result=await packager.create('user',{projectId:project.id,name:'release-prototype',version:'1.0.0',releaseNotes:'Verified prototype release.'});expect(result.verification).toMatchObject({valid:true,format:'tar.gz',manifest:true,checksums:true});expect(result.manifest.artifacts).toHaveLength(10);const stored=store.getFile(result.file.id,'user'),archive=await readFile(stored.storagePath),tar=gunzipSync(archive);expect([...archive.subarray(0,2)]).toEqual([0x1f,0x8b]);expect(tar.includes(Buffer.from('manifest.json'))).toBe(true);expect(tar.includes(Buffer.from('README.md'))).toBe(true);expect(tar.includes(Buffer.from('CHANGELOG.md'))).toBe(true)});it('refuses a release without verified artifacts',async()=>{const project=store.createProject('user','Empty','none');await expect(packager.create('user',{projectId:project.id,name:'empty',version:'1.0.0'})).rejects.toThrow()})})
