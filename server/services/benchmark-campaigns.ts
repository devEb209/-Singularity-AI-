import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { BenchmarkCampaign, BenchmarkJob, Capability } from '../domain.js'
import { AppError, NotFoundError } from '../lib/errors.js'
import { id, now } from '../lib/id.js'
import type { Store } from '../repositories/store.js'
import type { ModelCatalog } from './model-catalog.js'
import { benchmarkSuite } from './benchmark-suites.js'

const digest = (value: string) => createHash('sha256').update(value).digest('hex')

export class BenchmarkCampaignService {
  constructor(private store: Store, private catalog: ModelCatalog) {}

  create(userId: string, capability: Capability, benchmarkVersion: string) {
    const suite=benchmarkSuite(benchmarkVersion);if(!suite)throw new AppError('Suite de benchmark desconhecida.',400,'UNKNOWN_BENCHMARK_SUITE');if(suite.capability!==capability)throw new AppError('A suite não pertence à capacidade solicitada.',400,'BENCHMARK_CAPABILITY_MISMATCH')
    const coverage = this.catalog.benchmarkEligibility(capability)
    if (!coverage.eligible.length) throw new AppError('Nenhum modelo possui metadata explícita compatível.', 409, 'NO_BENCHMARK_ELIGIBLE_MODELS')
    const timestamp = now(); const campaignId = id('bench')
    const campaign: BenchmarkCampaign = { id: campaignId, userId, capability, benchmarkVersion, status: 'running', totalJobs: coverage.eligible.length, submittedJobs: 0, verifiedJobs: 0, failedJobs: 0, createdAt: timestamp, updatedAt: timestamp }
    const jobs: BenchmarkJob[] = coverage.eligible.map(model => ({ id: id('bjob'), campaignId, modelKey: model.key, status: 'pending', createdAt: timestamp, updatedAt: timestamp }))
    this.store.createBenchmarkCampaign(campaign, jobs)
    this.store.audit({ id: id('audit'), userId, action: 'benchmark.campaign.created', resource: campaignId, metadata: { capability, benchmarkVersion, jobs: jobs.length, missingMetadata: coverage.missingMetadata.length }, createdAt: timestamp })
    return { campaign, coverage: { totalCatalog: coverage.totalCatalog, eligible: coverage.eligible.length, catalogContractEligible: coverage.catalogContractEligible, missingMetadata: coverage.missingMetadata.length, excludedByExplicitModality: coverage.excludedByExplicitModality } }
  }

  list(userId: string) { return this.store.listBenchmarkCampaigns(userId) }
  detail(userId: string, campaignId: string, status?: BenchmarkJob['status'], limit=100, offset=0) { const campaign=this.store.getBenchmarkCampaign(campaignId,userId); return { campaign,jobs:this.store.listBenchmarkJobs(campaignId,{status,limit,offset}) } }

  claim(userId: string, campaignId: string) {
    const campaign = this.store.getBenchmarkCampaign(campaignId, userId)
    if (campaign.status !== 'running') throw new AppError('Campanha não está em execução.', 409, 'CAMPAIGN_NOT_RUNNING')
    this.releaseExpiredClaims(campaignId)
    const job = this.store.listBenchmarkJobs(campaignId, { status: 'pending', limit: 1 })[0]
    if (!job) throw new AppError('Nenhum job pendente nesta campanha.', 409, 'NO_PENDING_BENCHMARK_JOB')
    const claimToken = randomBytes(48).toString('base64url'); job.status='claimed'; job.claimTokenHash=digest(claimToken); job.claimExpiresAt=new Date(Date.now()+10*60_000).toISOString(); job.submittedBy=userId; job.updatedAt=now(); this.store.updateBenchmarkJob(job)
    const model=this.store.getExternalModel(job.modelKey); if(!model)throw new NotFoundError('Modelo')
    return { job:{ id:job.id,campaignId:job.campaignId,model:{ key:model.key,id:model.id,provider:model.provider },capability:campaign.capability,benchmarkVersion:campaign.benchmarkVersion,suite:benchmarkSuite(campaign.benchmarkVersion),expiresAt:job.claimExpiresAt },claimToken,trust:'untrusted-client-execution',instruction:'Execute somente o provider/id exato. O resultado ficará pendente de avaliação confiável e não altera tiers.' }
  }

  submit(userId:string,jobId:string,claimToken:string,output:Record<string,unknown>,latencyMs:number) {
    const job=this.store.getBenchmarkJob(jobId); if(!job)throw new NotFoundError('Benchmark job')
    const campaign=this.store.getBenchmarkCampaign(job.campaignId,userId)
    if(job.status!=='claimed'||!job.claimTokenHash||!job.claimExpiresAt)throw new AppError('Job não está reivindicado.',409,'JOB_NOT_CLAIMED')
    if(new Date(job.claimExpiresAt)<=new Date())throw new AppError('Lease do benchmark expirou.',409,'BENCHMARK_LEASE_EXPIRED')
    const supplied=Buffer.from(digest(claimToken));const expected=Buffer.from(job.claimTokenHash);if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))throw new AppError('Receipt de execução inválido.',401,'INVALID_EXECUTION_RECEIPT')
    job.status='submitted';job.output=output;job.latencyMs=latencyMs;job.claimTokenHash=undefined;job.claimExpiresAt=undefined;job.updatedAt=now();this.store.updateBenchmarkJob(job);this.recompute(campaign)
    return {jobId,status:job.status,trust:'awaiting-trusted-evaluation',tierChanged:false}
  }

  verify(jobId:string,score:number,success:boolean,error?:string) {
    const job=this.store.getBenchmarkJob(jobId);if(!job)throw new NotFoundError('Benchmark job')
    if(job.status!=='submitted')throw new AppError('Somente resultados submetidos podem ser verificados.',409,'JOB_NOT_SUBMITTED')
    const campaign=this.store.getBenchmarkCampaign(job.campaignId);job.status=success?'verified':'failed';job.error=error;job.updatedAt=now();this.store.updateBenchmarkJob(job)
    const ranking=this.catalog.recordEvaluation(job.modelKey,campaign.capability,score,campaign.benchmarkVersion,success,job.latencyMs);this.recompute(campaign)
    return {job,campaign,ranking,tierChanged:ranking.ranking.tier!=='UNRANKED'}
  }

  setStatus(userId:string,campaignId:string,status:'running'|'paused'|'cancelled') { const campaign=this.store.getBenchmarkCampaign(campaignId,userId);if(campaign.status==='completed'||campaign.status==='cancelled')throw new AppError('Campanha já foi encerrada.',409,'CAMPAIGN_CLOSED');campaign.status=status;campaign.updatedAt=now();this.store.updateBenchmarkCampaign(campaign);return campaign }

  private releaseExpiredClaims(campaignId:string){for(const job of this.store.listBenchmarkJobs(campaignId,{status:'claimed',limit:1000}))if(job.claimExpiresAt&&new Date(job.claimExpiresAt)<=new Date()){job.status='pending';job.claimTokenHash=undefined;job.claimExpiresAt=undefined;job.submittedBy=undefined;job.updatedAt=now();this.store.updateBenchmarkJob(job)}}
  private recompute(campaign:BenchmarkCampaign){const jobs=this.store.listBenchmarkJobs(campaign.id,{limit:1000});campaign.submittedJobs=jobs.filter(job=>job.status==='submitted'||job.status==='verified').length;campaign.verifiedJobs=jobs.filter(job=>job.status==='verified').length;campaign.failedJobs=jobs.filter(job=>job.status==='failed').length;if(campaign.verifiedJobs+campaign.failedJobs===campaign.totalJobs)campaign.status='completed';campaign.updatedAt=now();this.store.updateBenchmarkCampaign(campaign)}
}
