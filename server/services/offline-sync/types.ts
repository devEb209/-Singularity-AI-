export interface SyncDocument{key:string;revision:number;content:Record<string,unknown>;contentHash:string;updatedAt:string}
export interface OfflineOperation{id:string;deviceId:string;key:string;baseRevision:number;patch:Record<string,unknown>;createdAt:string}
export interface SyncConflict{operationId:string;key:string;baseRevision:number;serverRevision:number;fields:string[]}
export interface OfflineState{documents:SyncDocument[];appliedOperationIds:string[];conflicts:SyncConflict[];chunks:{uploadId:string;index:number;total:number;checksum:string;data:string}[]}
