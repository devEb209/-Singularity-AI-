export interface QueuedRequest{id:string;url:string;method:string;headers:Record<string,string>;body?:string;createdAt:string;attempts:number}
export interface QueueAdapter{put(request:QueuedRequest):Promise<void>;list():Promise<QueuedRequest[]>;remove(id:string):Promise<void>}
