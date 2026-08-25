import type { DivineProject } from '../domain.js'
import { id, now } from '../lib/id.js'
import type { Store } from '../repositories/store.js'
import type { CapabilityFabric } from './capability-fabric.js'
import type { MissionEngine, TaskDefinition } from './mission-engine.js'
import type { Procedural3DProvider } from './procedural-3d.js'

const bossTasks:TaskDefinition[]=[
  {key:'requirements',title:'Requirements & success criteria',kind:'boss:master-ai'},
  {key:'gdd',title:'Game Design Document',kind:'boss:game-director',dependsOn:['requirements']},
  {key:'architecture',title:'Runtime and project architecture',kind:'boss:engine',dependsOn:['gdd']},
  {key:'world',title:'World, terrain and streaming plan',kind:'boss:world',dependsOn:['architecture']},
  {key:'gameplay',title:'Gameplay systems',kind:'boss:gameplay',dependsOn:['architecture']},
  {key:'assets-3d',title:'3D asset production',kind:'boss:3d',dependsOn:['gdd'],input:{requiredCapabilities:['3d.generate','3d.retopology','3d.uv','3d.optimize','3d.export']}},
  {key:'textures',title:'PBR and stylized materials',kind:'boss:texture',dependsOn:['assets-3d'],input:{requiredCapabilities:['material.pbr']}},
  {key:'animation',title:'Rigging and animation',kind:'boss:animation',dependsOn:['assets-3d'],input:{requiredCapabilities:['rig.character','animation.motion']}},
  {key:'audio',title:'Audio, ambience and SFX',kind:'boss:audio',dependsOn:['gdd']},
  {key:'npcs',title:'NPC civilization',kind:'boss:npc',dependsOn:['world','gameplay']},
  {key:'integration',title:'Project integration',kind:'boss:engine',dependsOn:['world','gameplay','textures','animation','audio','npcs']},
  {key:'optimization',title:'Quality-preserving optimization',kind:'boss:optimization',dependsOn:['integration']},
  {key:'quality',title:'Deterministic quality gates',kind:'boss:quality',dependsOn:['optimization']},
  {key:'build',title:'Target build artifact',kind:'boss:build',dependsOn:['quality']},
]

export class DivineEngineService{
  constructor(private store:Store,private missions:MissionEngine,private fabric:CapabilityFabric,private procedural3d?:Procedural3DProvider){}
  create(userId:string,input:{name:string;brief:string;target:DivineProject['target'];executionPolicy:DivineProject['executionPolicy'];deviceProfile:Record<string,unknown>}){const project=this.store.createProject(userId,input.name,input.brief),pipeline=this.fabric.synthesize3D(input.brief),mission=this.missions.create(userId,`Divine Engine: ${input.brief}`,bossTasks,project.id,{userIntent:input.brief,requiredCapabilities:['game.design','game.engine','world.build','gameplay','3d.generate','material.pbr','animation.motion','audio.generate','npc.system','build'],availableResources:this.fabric.list({status:'active'}).map(item=>item.id),risks:['Capability gaps','External provider availability','Performance budget','Artifact quality'],successCriteria:['Playable target build exists','All required artifacts exist','Quality gates pass'],verificationRequirements:['Artifact hashes','Build validation','Performance report','Requirement traceability'],finalDeliverable:`Playable ${input.target} project with provenance`,autonomy:'SUPERVISED'}),timestamp=now(),divine:DivineProject={id:id('divine'),userId,projectId:project.id,missionId:mission.mission.id,name:input.name,brief:input.brief,target:input.target,format:'snb-divine-project-v1',executionPolicy:input.executionPolicy,deviceProfile:input.deviceProfile,status:pipeline.gaps.length?'blocked':'created',createdAt:timestamp,updatedAt:timestamp};this.store.createDivineProject(divine);this.store.audit({id:id('audit'),userId,action:'divine.project.created',resource:divine.id,metadata:{projectId:project.id,missionId:mission.mission.id,target:input.target,gaps:pipeline.gaps},createdAt:timestamp});return this.detail(userId,divine.id)}
  async createProceduralPrototype(userId:string,divineId:string,prompt?:string){const divine=this.store.getDivineProject(divineId,userId);if(!this.procedural3d)throw new Error('Procedural 3D provider unavailable');const result=await this.procedural3d.generate(userId,{prompt:prompt??divine.brief,projectId:divine.projectId,name:`${divine.name}-prototype`});this.store.audit({id:id('audit'),userId,action:'divine.prototype.generated',resource:divine.id,metadata:{fileId:result.artifact.id,provider:result.provider.id,verified:result.verification.valid,limitations:result.limitations},createdAt:now()});return{result,project:this.detail(userId,divineId)}}
  list(userId:string){return this.store.listDivineProjects(userId).map(project=>this.summary(userId,project))}
  detail(userId:string,divineId:string){const divine=this.store.getDivineProject(divineId,userId),mission=this.missions.detail(userId,divine.missionId),pipeline3d=this.fabric.synthesize3D(divine.brief),files=this.store.listFiles(userId,divine.projectId).map(({storagePath:_,...file})=>file),bosses=mission.tasks.map(task=>({id:task.key,boss:task.kind.replace('boss:',''),title:task.title,status:task.status,progress:task.progress,attempts:task.attempts,output:task.output,error:task.error}));return{divine,project:this.store.getProject(divine.projectId,userId),mission:mission.mission,contract:mission.contract,bosses,events:mission.events,artifacts:files,pipeline3d,execution:this.executionPlan(divine,pipeline3d.gaps)}}
  private summary(userId:string,divine:DivineProject){const mission=this.store.getMission(divine.missionId,userId),tasks=this.store.listMissionTasks(divine.missionId);return{...divine,missionStatus:mission.status,progress:mission.progress,bosses:{total:tasks.length,completed:tasks.filter(item=>item.status==='completed').length,running:tasks.filter(item=>item.status==='running').length,failed:tasks.filter(item=>item.status==='failed').length},artifactCount:this.store.listFiles(userId,divine.projectId).length}}
  private executionPlan(project:DivineProject,gaps:string[]){const profile=project.deviceProfile,tier=profile.tier==='low'?'low':profile.tier==='high'?'high':'balanced';return{policy:project.executionPolicy,deviceTier:tier,deviceRole:'terminal',preview:tier==='low'?{mode:'thumbnails-streamed',maxResolution:'480p',viewport:false}:{mode:'progressive-stream',maxResolution:tier==='high'?'1080p':'720p',viewport:tier==='high'},heavyCompute:'remote-or-external-required',executable:gaps.length===0,gaps}}
}
