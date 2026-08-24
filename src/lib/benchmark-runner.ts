import { api } from './api'
import { puterGateway } from './puter'

const responseText = (value: unknown) => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const object = value as { message?: { content?: unknown }; text?: unknown }
    if (typeof object.message?.content === 'string') return object.message.content
    if (typeof object.text === 'string') return object.text
  }
  throw new Error('O modelo retornou um formato sem texto reconhecível para esta suite.')
}

export async function runOnePuterBenchmark(campaignId: string, progress?: (message: string) => void) {
  progress?.('Reivindicando job com lease seguro')
  const claim = await api.claimBenchmark(campaignId)
  if (claim.job.suite.cases.some(item => item.modality !== 'text')) throw new Error('Esta suite exige fixtures multimodais que ainda não estão disponíveis no runner web.')
  if (!await puterGateway.user()) { progress?.('Autenticando diretamente com Puter'); await puterGateway.signIn() }
  await puterGateway.discover()
  const started = performance.now(); const results: { caseId:string;content:string;criteria:string[] }[]=[]
  for (const benchmarkCase of claim.job.suite.cases) {
    progress?.(`Executando ${benchmarkCase.id} em ${claim.job.model.provider}/${claim.job.model.id}`)
    const response = await puterGateway.chat(claim.job.model.provider, claim.job.model.id, benchmarkCase.prompt, { stream:false })
    results.push({ caseId:benchmarkCase.id,content:responseText(response),criteria:benchmarkCase.criteria })
  }
  progress?.('Enviando receipt e resultado para avaliação protegida')
  const submission = await api.submitBenchmark(claim.job.id,claim.claimToken,{suite:claim.job.suite.version,modelKey:claim.job.model.key,results},Math.round(performance.now()-started))
  return { claim, submission }
}
