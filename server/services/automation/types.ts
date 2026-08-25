import type { TaskDefinition } from '../mission-engine.js'
export type AutomationTrigger={kind:'schedule';cron:string}|{kind:'event';event:string;filters:Record<string,string>}
export interface AutomationAction{kind:'create-mission';goal:string;tasks:TaskDefinition[]}
export interface AutomationDefinition{id:string;userId:string;projectId:string;name:string;enabled:boolean;trigger:AutomationTrigger;action:AutomationAction;nextRunAt?:string;createdAt:string;updatedAt:string}
export interface AutomationExecution{id:string;automationId:string;userId:string;status:'completed'|'failed'|'skipped';event?:string;missionId?:string;error?:string;receipt:string;createdAt:string}
export interface AutomationState{definitions:AutomationDefinition[];executions:AutomationExecution[]}
