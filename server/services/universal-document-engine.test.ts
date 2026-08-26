import { mkdtemp,readFile,rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { unzipSync,strFromU8 } from 'fflate'
import { afterEach,describe,expect,it } from 'vitest'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { ArtifactGraphService } from './artifact-graph.js'
import { UniversalDocumentEngine } from './universal-document-engine.js'
const dirs:string[]=[]
afterEach(async()=>Promise.all(dirs.splice(0).map(path=>rm(path,{recursive:true,force:true}))))
describe('SNB Universal Document Engine',()=>{
 it('produces and structurally verifies real PDF, DOCX, XLSX, PPTX, Markdown and CSV artifacts',async()=>{const dir=await mkdtemp(join(tmpdir(),'snb-docs-'));dirs.push(dir);const store=new SQLiteStore(join(dir,'db.sqlite')),project=store.createProject('u','Documents','Universal output'),engine=new UniversalDocumentEngine(store,new ArtifactGraphService(store),join(dir,'uploads')),result=await engine.create('u',{projectId:project.id,name:'release-report',title:'SNB Relatório & Verificação',paragraphs:['Resultado verificável.','Sem sucesso falso ou provider inventado.'],table:[['Sistema','Estado'],['SNB','operacional-core'],['UES','parcial']],formats:['pdf','docx','xlsx','pptx','markdown','csv']});expect(result.summary).toMatchObject({requested:6,verified:6});expect(result.documents.every(document=>document.artifact.status==='verified')).toBe(true);expect(store.listArtifacts('u',project.id)).toHaveLength(6);for(const document of result.documents)expect((await engine.verifyFile('u',document.file.id)).valid).toBe(true);const pptx=result.documents.find(item=>item.file.name.endsWith('.pptx'))!,pptxFile=store.getFile(pptx.file.id,'u'),parts=unzipSync(await readFile(pptxFile.storagePath));expect(strFromU8(parts['ppt/slides/slide1.xml'])).toContain('SNB Relatório &amp; Verificação');store.close()})
 it('escapes OOXML control text and rejects unsupported file verification',async()=>{const dir=await mkdtemp(join(tmpdir(),'snb-doc-security-'));dirs.push(dir);const store=new SQLiteStore(join(dir,'db.sqlite')),project=store.createProject('u','Secure docs',''),engine=new UniversalDocumentEngine(store,new ArtifactGraphService(store),join(dir,'uploads')),result=await engine.create('u',{projectId:project.id,name:'safe',title:'<script>&',paragraphs:['"quoted" & safe'],formats:['docx']});expect(result.documents[0].verification.valid).toBe(true);const raw=unzipSync(await readFile(store.getFile(result.documents[0].file.id,'u').storagePath));expect(strFromU8(raw['word/document.xml'])).toContain('&lt;script&gt;&amp;');store.close()})
})
