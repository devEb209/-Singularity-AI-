export type DKey='D1'|'D2'|'D3'|'D4'|'D5'|'D6'|'D7'|'D8'|'D9'|'D10'|'D11'|'D12'|'D13'|'D14'|'D15'
export interface DDefinition{key:DKey;name:string;purpose:string;facets:{level:'D'|'D.25'|'D.5'|'D.75';function:string}[];signals:string[]}
export interface DContext{objective:string;context?:string;constraints:string[];resources:string[];priorities:{quality:number;performance:number;safety:number;cost:number;scalability:number};maxIterations?:number}
export interface DCandidate{id:string;strategy:string;metrics:{quality:number;performance:number;safety:number;costEfficiency:number;scalability:number;stability:number};assumptions:string[]}
export interface PerfectPoint{d:DKey;localScore:number;confidence:number;limitingFactors:string[];selectedFacet:'D'|'D.25'|'D.5'|'D.75'}
export const dThesisScope={physicalDimensions:false,mathematicalDimensions:false,unlockLadder:false,roadmapLevels:false,notLimitedToGraphicsOrPhysics:true,applicableToAnyComputableDomain:true,realismMandatory:false,closedModuleList:false,absolutePerfectionClaim:false,replacesNothing:true} as const
