import type { TaskDefinition } from '../mission-engine.js'
export type Condition={path:string;operator:'eq'|'neq'|'gt'|'gte'|'lt'|'lte'|'includes'|'exists';value?:unknown}
export interface BranchRequest{reason:string;facts:Record<string,unknown>;condition:Condition;then:TaskDefinition[];otherwise:TaskDefinition[]}
export interface CompensationDefinition{forTask:string;title:string;kind:string;input?:Record<string,unknown>}
