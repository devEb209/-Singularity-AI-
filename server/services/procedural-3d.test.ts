import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { Procedural3DProvider } from './procedural-3d.js'

const root='./data/test-procedural-3d';let store:SQLiteStore,provider:Procedural3DProvider
beforeEach(()=>{store=new SQLiteStore(':memory:');provider=new Procedural3DProvider(store,root)})
afterEach(async()=>{store.close();await rm(root,{recursive:true,force:true})})

describe('SNB Procedural 3D Provider',()=>{
 it('generates a real verified animated PBR GLB artifact',async()=>{const result=await provider.generate('user-3d',{prompt:'blue sci-fi crate',name:'crate'});expect(result.artifact.mimeType).toBe('model/gltf-binary');expect(result.artifact.name).toBe('crate.glb');expect(result.artifact.size).toBeGreaterThan(1000);expect(result.verification).toMatchObject({valid:true,format:'GLB',gltfVersion:'2.0',vertices:24,triangles:12,hasUV:true,hasNormals:true,hasPBR:true,animations:1});const stored=store.getFile(result.artifact.id,'user-3d'),buffer=await readFile(stored.storagePath);expect(buffer.subarray(0,4).toString()).toBe('glTF');expect(stored.checksum).toMatch(/^[a-f0-9]{64}$/)})
 it('rejects corrupted artifact content during verification',async()=>{const result=await provider.generate('user-3d',{prompt:'test'}),stored=store.getFile(result.artifact.id,'user-3d');await writeFile(stored.storagePath,Buffer.from('not a glb'));expect((await provider.verifyFile('user-3d',result.artifact.id)).valid).toBe(false)})
})
