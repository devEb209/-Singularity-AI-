import { createHash, createHmac } from 'node:crypto'
import { AppError } from '../lib/errors.js'
import { id, now } from '../lib/id.js'
import type { Store } from '../repositories/store.js'

interface ExecutionInput{conversationId?:string;prompt:string;response:string;provider:string;modelId:string;durationMs:number;fallbackChain:{provider:string;modelId:string;error:string}[];startedAt:string}
const sha=(value:string)=>createHash('sha256').update(value).digest('hex')

export class PuterExecutionReports{
  constructor(private store:Store,private secret:string){}
  record(userId:string,input:ExecutionInput){const modelKey=`puter:${input.provider}:${input.modelId}`,model=this.store.getExternalModel(modelKey);if(!model||!model.available)throw new AppError('Modelo não pertence ao catálogo Puter canônico disponível.',400,'PUTER_MODEL_NOT_CANONICAL')
    for(const failure of input.fallbackChain)if(!this.store.getExternalModel(`puter:${failure.provider}:${failure.modelId}`))throw new AppError('Fallback contém modelo não canônico.',400,'PUTER_FALLBACK_NOT_CANONICAL')
    const conversation=input.conversationId?this.store.getConversation(input.conversationId,userId):this.store.createConversation(userId,input.prompt.replace(/\s+/g,' ').slice(0,56)||'Puter chat')
    this.store.addMessage(conversation.id,userId,'user',input.prompt,{source:'puter-client-report'})
    const assistant=this.store.addMessage(conversation.id,userId,'assistant',input.response,{source:'puter-client-report',provider:input.provider,modelId:input.modelId,modelKey,trust:'client-reported',verificationStatus:'not-verified',fallbackCount:input.fallbackChain.length})
    const createdAt=now(),reportId=id('puterexec'),payload={id:reportId,userId,conversationId:conversation.id,modelKey,promptHash:sha(input.prompt),responseHash:sha(input.response),durationMs:input.durationMs,fallbackChain:input.fallbackChain,startedAt:input.startedAt,createdAt,trust:'client-reported' as const}
    const receipt=`snb-client-report-hmac:${createHmac('sha256',this.secret).update(JSON.stringify(payload)).digest('hex')}`
    const report=this.store.createPuterExecutionReport({...payload,provider:input.provider,modelId:input.modelId,receipt})
    this.store.audit({id:id('audit'),userId,action:'puter.execution.reported',resource:report.id,metadata:{modelKey,conversationId:conversation.id,trust:report.trust,fallbackCount:report.fallbackChain.length},createdAt})
    return{conversationId:conversation.id,message:assistant,report,trust:{execution:'client-reported',providerAttested:false,verification:{status:'not-verified',deterministic:false}},warning:'O receipt prova o registro feito pelo backend, não uma atestação criptográfica emitida pelo Puter.'}
  }
  list(userId:string,limit=100){return this.store.listPuterExecutionReports(userId,limit)}
}
