import { mkdtemp,rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach,describe,expect,it } from 'vitest'
import { SQLiteStore } from '../repositories/sqlite-store.js'
import { ArtifactGraphService } from './artifact-graph.js'
import { ContextEngine } from './context-engine.js'
import { MissionEngine } from './mission-engine.js'
import { ModelCatalog } from './model-catalog.js'
import { UniversalProblemSolver } from './problem-solver.js'
import { SnbMasterIntelligence,snbCognitivePrograms } from './snb-master-intelligence.js'
const dirs:string[]=[]
afterEach(async()=>Promise.all(dirs.splice(0).map(dir=>rm(dir,{recursive:true,force:true}))))
async function fixture(){const dir=await mkdtemp(join(tmpdir(),'snb-master-'));dirs.push(dir);const store=new SQLiteStore(join(dir,'db.sqlite')),project=store.createProject('u','Amphibious Vehicle','Cross-domain simulation');store.createMemory('u','O target prioritário é web em dispositivo de baixo desempenho.','preference',90,project.id);const master=new SnbMasterIntelligence(store,new MissionEngine(store),new UniversalProblemSolver(new ModelCatalog(store)),new ContextEngine(store),new ArtifactGraphService(store),join(dir,'uploads'));return{store,project,master}}
describe('SNB Master Intelligence Fabric',()=>{
 it('registers all 30 cognitive programs with honest scoped states',async()=>{const{store,master}=await fixture(),registry=master.registry();expect(snbCognitivePrograms).toHaveLength(30);expect(registry.summary['operational-core']).toBeGreaterThan(0);expect(registry.data.every(item=>item.implementedScope&&item.evidence&&item.nextLevel)).toBe(true);expect(registry.rule).toContain('not a claim');store.close()})
 it('compiles intent into scenarios, temporary specialists, critics, adaptive mission and verified artifact',async()=>{const{store,project,master}=await fixture(),result=await master.compile('u',{projectId:project.id,intent:'Crie e teste um sistema de física para um jogo web de veículos anfíbios com otimização para dispositivo fraco.',constraints:['Precisa preservar qualidade visual','Exigir evidências e rollback']});expect(result.artifact.status).toBe('verified');expect(result.program.specialists.length).toBeGreaterThanOrEqual(4);expect(result.program.scenarios).toHaveLength(3);expect(result.program.decision.rationale).toContain('score');expect(result.mission.tasks.some(task=>task.kind==='critic:matrix')).toBe(true);expect(result.mission.tasks.at(-1)?.kind).toBe('master:delivery');expect(result.execution.status).toBe('compiled-awaiting-workers');expect(store.listArtifacts('u',project.id)[0].type).toBe('plan.snb-cognitive-program');expect(store.listMemories('u',project.id).some(memory=>memory.kind==='decision')).toBe(true);store.close()})
 it('blocks verification when intent constraints directly contradict each other',async()=>{const{store,project,master}=await fixture(),result=await master.compile('u',{projectId:project.id,intent:'Crie um sistema offline usando Puter online.',constraints:['Sem internet','API obrigatória']});expect(result.artifact.status).toBe('rejected');expect(result.program.contradictions.length).toBeGreaterThan(0);expect(result.program.critics.blockingFindings[0].critic).toBe('Consistency Critic');store.close()})
})
