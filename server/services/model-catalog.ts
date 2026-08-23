import { createHash } from 'node:crypto'
import type { Capability, ExternalModel, ModelEvaluation } from '../domain.js'
import { AppError } from '../lib/errors.js'
import { id, now } from '../lib/id.js'
import type { Store } from '../repositories/store.js'

export interface PuterModelInput {
  id: string
  provider: string
  name?: string
  aliases?: string[]
  context?: number
  max_tokens?: number
  cost?: { input?: number; output?: number }
  [key: string]: unknown
}

export type EvaluatedTier = 'S++' | 'S+' | 'S' | 'A+' | 'A' | 'B' | 'C' | 'UNRANKED'

export class ModelCatalog {
  constructor(private store: Store) {}

  syncPuter(inputs: PuterModelInput[]) {
    const seenAt = now(); const unique = new Map<string, ExternalModel>()
    for (const input of inputs) {
      const modelId = input.id.trim(); const provider = input.provider.trim()
      if (!modelId || !provider) continue
      const key = `puter:${provider}:${modelId}`
      const existing = this.store.getExternalModel(key)
      unique.set(key, { key, source: 'puter', id: modelId, provider, name: input.name?.trim() || undefined, aliases: Array.isArray(input.aliases) ? [...new Set(input.aliases.filter(alias => typeof alias === 'string' && alias.trim()).map(alias => alias.trim()))] : [], contextWindow: this.positive(input.context), maxTokens: this.positive(input.max_tokens), inputCost: this.nonNegative(input.cost?.input), outputCost: this.nonNegative(input.cost?.output), rawMetadata: this.safeMetadata(input), firstSeenAt: existing?.firstSeenAt ?? seenAt, lastSeenAt: seenAt, available: true })
    }
    if (!unique.size) throw new AppError('O catálogo Puter recebido está vazio.', 400, 'EMPTY_PUTER_CATALOG')
    const result = this.store.syncExternalModels([...unique.values()], 'puter', seenAt)
    return { ...result, total: unique.size, snapshot: createHash('sha256').update([...unique.keys()].sort().join('\n')).digest('hex'), syncedAt: seenAt }
  }

  list(options: { provider?: string; available?: boolean; limit?: number; offset?: number } = {}) {
    return this.store.listExternalModels('puter', options).map(model => ({ ...model, rawMetadata: undefined, evaluations: this.scores(model.key) }))
  }

  summary() {
    const models = this.store.listExternalModels('puter', { available: true, limit: 1000 })
    const providers = [...new Set(models.map(model => model.provider))].sort()
    const evaluated = models.filter(model => this.store.listModelEvaluations(model.key).length > 0).length
    return { total: this.store.countExternalModels('puter'), providers, providerCount: providers.length, evaluated, unranked: models.length - evaluated }
  }

  recordEvaluation(modelKey: string, capability: Capability, score: number, benchmark: string, success: boolean, latencyMs?: number) {
    const model = this.store.getExternalModel(modelKey)
    if (!model || model.source !== 'puter') throw new AppError('Modelo não existe no catálogo Puter sincronizado.', 404, 'PUTER_MODEL_NOT_FOUND')
    const evaluation: ModelEvaluation = { id: id('eval'), modelKey, capability, score, benchmark, success, latencyMs, createdAt: now() }
    this.store.saveModelEvaluation(evaluation); return { evaluation, ranking: this.score(modelKey, capability) }
  }

  route(capability: Capability, limit = 8) {
    const candidates = this.store.listExternalModels('puter', { available: true, limit: 1000 }).map(model => { const circuit=this.store.getCircuitState(`model:${model.key}`);const circuitOpen=circuit?.state==='open'&&circuit.cooldownUntil!==undefined&&new Date(circuit.cooldownUntil)>new Date();return { model, ranking: this.score(model.key, capability), health:{circuit:circuit?.state??'closed',routingAllowed:!circuitOpen} } }).filter(item => item.ranking.tier !== 'UNRANKED'&&item.health.routingAllowed).sort((a, b) => b.ranking.score - a.ranking.score || a.ranking.latencyMs - b.ranking.latencyMs).slice(0, limit)
    return { capability, candidates, policy: candidates.length ? 'benchmark-ranked' : 'no-evaluated-model', warning: candidates.length ? undefined : 'Nenhum modelo possui evidência suficiente para esta capacidade. Nenhum tier foi inventado.' }
  }

  webSearchPlan(query:string,count=4){
    const eligible=this.store.listExternalModels('puter',{available:true,limit:1000}).filter(model=>{const costs=model.rawMetadata.costs as Record<string,unknown>|undefined;return typeof costs?.web_search==='number'||model.rawMetadata.web_search===true})
    if(!eligible.length)throw new AppError('Nenhum modelo possui metadata explícita de web_search.',409,'NO_WEB_SEARCH_MODELS')
    const digest=createHash('sha256').update(query).digest();const start=digest.readUInt32BE(0)%eligible.length,target=Math.min(Math.max(count,2),8,eligible.length),stride=Math.max(1,Math.floor(eligible.length/target)),researchers=Array.from({length:target},(_,index)=>eligible[(start+index*stride)%eligible.length]).map(model=>({key:model.key,id:model.id,provider:model.provider,name:model.name})),synthesizer=eligible[(start+target*stride+Math.floor(stride/2))%eligible.length]
    return{query,policy:'explicit-web-search-metadata-unranked-beta',eligibleTotal:eligible.length,researchers,synthesizer:{key:synthesizer.key,id:synthesizer.id,provider:synthesizer.provider,name:synthesizer.name},warning:'Elegibilidade vem de metadata web_search; qualidade ainda depende de benchmarks e verificação de fontes.'}
  }

  benchmarkEligibility(capability: Capability) {
    const all = this.store.listExternalModels('puter', { available: true, limit: 1000 })
    const eligible: ExternalModel[] = []; const missingMetadata: ExternalModel[] = []; let catalogContractEligible = 0
    for (const model of all) {
      const modalities = model.rawMetadata.modalities as { input?: unknown; output?: unknown } | undefined
      const input = Array.isArray(modalities?.input) ? modalities.input.filter((item): item is string => typeof item === 'string') : []
      const output = Array.isArray(modalities?.output) ? modalities.output.filter((item): item is string => typeof item === 'string') : []
      if (!input.length || !output.length) {
        if (capability !== 'vision') { eligible.push(model); catalogContractEligible++ } else missingMetadata.push(model)
        continue
      }
      const accepted = capability === 'vision' ? input.some(item => item === 'image' || item === 'video') : capability === 'creative' ? input.includes('text') && output.some(item => ['text','image','audio','video'].includes(item)) : input.includes('text') && output.includes('text')
      if (accepted) eligible.push(model)
    }
    return { capability, totalCatalog: all.length, eligible, missingMetadata, catalogContractEligible, excludedByExplicitModality: all.length - eligible.length - missingMetadata.length }
  }

  private scores(modelKey: string) {
    const capabilities: Capability[] = ['chat','reasoning','code','research','vision','creative','planning']
    return Object.fromEntries(capabilities.map(capability => [capability, this.score(modelKey, capability)]))
  }
  private score(modelKey: string, capability: Capability) {
    const evidence = this.store.listModelEvaluations(modelKey).filter(item => item.capability === capability)
    const successes = evidence.filter(item => item.success)
    if (evidence.length < 3 || !successes.length) return { tier: 'UNRANKED' as EvaluatedTier, score: 0, confidence: 0, evidence: evidence.length, latencyMs: 0 }
    const average = successes.reduce((sum, item) => sum + item.score, 0) / successes.length
    const successRate = successes.length / evidence.length
    const score = Math.round(average * successRate * 100) / 100
    const tier: EvaluatedTier = score >= 95 ? 'S++' : score >= 90 ? 'S+' : score >= 82 ? 'S' : score >= 74 ? 'A+' : score >= 66 ? 'A' : score >= 55 ? 'B' : 'C'
    const latency = successes.filter(item => item.latencyMs !== undefined)
    return { tier, score, confidence: Math.min(1, evidence.length / 20), evidence: evidence.length, latencyMs: latency.length ? Math.round(latency.reduce((sum, item) => sum + item.latencyMs!, 0) / latency.length) : 0 }
  }
  private positive(value: unknown) { return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined }
  private nonNegative(value: unknown) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined }
  private safeMetadata(input: PuterModelInput) { const serialized = JSON.stringify(input); if (serialized.length > 50_000) throw new AppError(`Metadata excessiva para ${input.id}.`, 413, 'MODEL_METADATA_TOO_LARGE'); return JSON.parse(serialized) as Record<string, unknown> }
}
