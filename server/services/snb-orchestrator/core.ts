import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { clientPuterPlan } from './client-plan.js'
import { orchestrate } from './execute.js'

export class SnbOrchestratorCore {
  private thesis = new DThesisCore()

  process(intent = 'ponte de pedra e recorte esferico') {
    const run = orchestrate(intent)
    const plan = clientPuterPlan(intent)
    const independent = new Set(run.tickets.map(item => item.provider)).size >= Math.min(2, run.tickets.length)
    const kernel = runKernel(`Orquestrar Gênesis internamente: ${intent}`, 'snb.orchestrator', ['solid', 'semantic-3d', 'consensus'], [
      { module: 'knowledge', accepted: true, note: intent },
      { module: 'd-thesis', accepted: true, note: 'internal first' },
      { module: 'orchestrator', accepted: run.automaticInternal, note: 'auto internal' },
      { module: 'represent', accepted: true, note: 'tickets are not execution' },
      { module: 'd-o15', accepted: true, note: 'do not fire 879' },
      { module: 'execute', accepted: run.readyToIntegrate, note: 'internal artifacts' },
      { module: 'verify', accepted: !run.automaticPuter && run.tickets.every(item => item.status === 'pending-client') && plan.critic.accepted && !plan.critic.puterExecuted, note: 'puter pending + internal critic' },
      { module: 'refine', accepted: independent || run.tickets.length === 0, note: 'independent providers' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Disparar automaticamente o que a SNB já possui; Puter só via ticket canônico',
      constraints: ['não inventar model id', 'não fingir Puter no servidor'],
      resources: ['internal cores', 'puter-models.txt'],
      priorities: { quality: 8, performance: 7, safety: 9, cost: 4, scalability: 8 },
    })
    return {
      format: 'snb-orchestrator-v1',
      intent,
      ...run,
      clientPlan: { automaticWhenPuterPresent: plan.automaticWhenPuterPresent, serverExecutesPuter: plan.serverExecutesPuter, criticAccepted: plan.critic.accepted },
      independentProviders: independent,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && run.readyToIntegrate && !run.automaticPuter,
        automaticInternal: true,
        automaticPuter: false,
      },
      limitations: ['Internal tools execute now', 'Puter remains a client-reported ticket'],
    }
  }
}
