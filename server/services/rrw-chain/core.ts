import { DThesisCore } from '../d-thesis/core.js'
import { runChain } from '../rrw/chain.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwChainCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado sob céu nublado com fogo, floresta e um humano') {
    const chain = runChain(prompt)
    const kernel = runKernel('Cadeia Gênesis: descrever → conhecer → RRW → D-O15 → sessão → verificar → refinar', 'rrw.chain', ['rrw', 'session'], [
      { module: 'knowledge', accepted: chain.knowledge.puterFired === false && chain.knowledge.nasa === false, note: 'internal consult' },
      { module: 'd-thesis', accepted: chain.intent.realismRequired === false, note: 'realism not mandatory' },
      { module: 'genesis', accepted: chain.executed && !chain.verification.genesisClosed, note: 'ten steps execute, not closed' },
      { module: 'represent', accepted: chain.composed.heightfieldIsIdentity === false, note: 'composed reality' },
      { module: 'd-o15', accepted: chain.devices.sameIds && chain.devices.weakerDescribesLess, note: 'same ids, different description' },
      { module: 'execute', accepted: chain.session.resumed && chain.seasons.summerWarmer && chain.hydro.conserved && chain.society.workSeen, note: 'time + water + society' },
      { module: 'verify', accepted: !chain.verification.traditionalPipeline && chain.critic.accepted && chain.observed.nightDimmer, note: 'not a renamed engine' },
      { module: 'refine', accepted: chain.refine.settled && chain.memory.eraseHistory === false, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Executar a cadeia de sucesso da Gênesis sem copiar Unreal nem fechar no papel',
      constraints: ['sem WebGPU obrigatório', 'sem Puter falso', 'sem consciência', 'sem shader de estação'],
      resources: ['intent', 'session', 'season', 'hydrology', 'D-O15'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 10 },
    })
    return {
      ...chain,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...chain.verification,
        valid: kernel.verification.valid && chain.verification.valid,
      },
    }
  }
}
